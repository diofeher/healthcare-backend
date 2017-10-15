import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import { Environment } from 'storj';

var storj = new Environment({
          bridgeUrl: 'https://api.storj.io',
          bridgeUser: 'diofeher@gmail.com',
          bridgePass: 'test123',
          encryptionKey: 'member chunk want clarify manage blossom unable cream when fiction dance steak',
          logLevel: 0
        });
var bucketId = 'd6f74c949738d5303a8dea80';
var fs = require('fs');

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

    api.post('/upload/', (req, res) => {
        // SAVE THE DATA AND SEND THE FILE TO STORJ
        // TODO: Randomize the file name or use stream in Storj.io
        // console.log(req.body);
        var filePath = __dirname + req.body.userId;
        storj.listFiles(bucketId, function(err, result) {
            for(var i=0; i<result.length; i++) {
                if(filePath == result[i]['filename']) {
                    storj.deleteFile(bucketId, result[i]['id'], function(err, result) {
                    });
                }
            }
            fs.appendFile(filePath, req.body.data, function(err) {
                if (err) {
                    return console.log(err);
                }
                else {
                    storj.storeFile(bucketId, filePath, {
                        filename: filePath,
                        progressCallback: function(progress, downloadedBytes, totalBytes) {
                            console.log('progress:', progress);
                        },
                        finishedCallback: function(err, fileId) {
                            if (err) {
                              return console.error(err);
                            }
                            console.log('File complete:', fileId);
                            fs.unlink(filePath);
                            res.json({fileID: fileId});
                        }
                    });
                }
            });
        }); 
    });

    api.get('/download/:fileid/', (req, res) => {
        var filePath = __dirname + '/test.js';
        fs.stat(filePath, function(err, result) {
            if(err == null) {
                console.log('unlink file first');
                fs.unlinkSync(filePath);
            }
            var state = storj.resolveFile(bucketId, req.params.fileid, filePath, {
              progressCallback: function(progress, downloadedBytes, totalBytes) {},
              finishedCallback: function(err) {
                if (err) {
                  return console.error(err);
                }
                else {
                    fs.readFile(filePath, 'utf8', function (err,data) {
                        if (err) {
                            return console.log(err);
                        }
                        fs.unlink(filePath)
                        res.json({data: data})
                    });
                }
                console.log('File download complete');
              }
            });
        });
    });

	return api;
}

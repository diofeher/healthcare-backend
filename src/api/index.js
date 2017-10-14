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
var filename = 'health-data.json';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

    api.post('/upload/', (req, res) => {
        // console.log(req.body.data);
        // SAVE THE DATA AND SEND THE FILE TO STORJ
        // TODO: Randomize the file name or use stream in Storj.io
        var filePath = __dirname + '/data.txt';
        var fs = require('fs');
        fs.writeFile(filePath, req.body, function(err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
        });

        storj.storeFile(bucketId, filePath, {
          filename: filename,
          progressCallback: function(progress, downloadedBytes, totalBytes) {
            console.log('progress:', progress);
          },
          finishedCallback: function(err, fileId) {
            if (err) {
              return console.error(err);
            }
            console.log('File complete:', fileId);
          }
        });
        fs.unlink(filePath);
        res.json({data: 'halo' });
    });

    api.get('/download/', (req, res) => {
        var fileId = '998960317b6725a3f8080c2b';
        var downloadFilePath = './' + filename;

        var state = storj.resolveFile(bucketId, fileId, downloadFilePath, {
          progressCallback: function(progress, downloadedBytes, totalBytes) {
            console.log('progress:', progress)
          },
          finishedCallback: function(err) {
            if (err) {
              return console.error(err);
            }
            console.log('File download complete');
          }
        });
    });

	return api;
}

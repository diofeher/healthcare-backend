'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _package = require('../../package.json');

var _express = require('express');

var _facets = require('./facets');

var _facets2 = _interopRequireDefault(_facets);

var _storj = require('storj');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storj = new _storj.Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: 'diofeher@gmail.com',
    bridgePass: 'test123',
    encryptionKey: 'member chunk want clarify manage blossom unable cream when fiction dance steak',
    logLevel: 0
});
var bucketId = 'd6f74c949738d5303a8dea80';
var fs = require('fs');

exports.default = function (_ref) {
    var config = _ref.config,
        db = _ref.db;

    var api = (0, _express.Router)();

    // mount the facets resource
    api.use('/facets', (0, _facets2.default)({ config: config, db: db }));

    // perhaps expose some API metadata at the root
    api.get('/', function (req, res) {
        res.json({ version: _package.version });
    });

    api.post('/upload/', function (req, res) {
        // SAVE THE DATA AND SEND THE FILE TO STORJ
        // TODO: Randomize the file name or use stream in Storj.io
        // console.log(req.body);
        var filePath = __dirname + req.body.userId;
        storj.listFiles(bucketId, function (err, result) {
            for (var i = 0; i < result.length; i++) {
                if (filePath == result[i]['filename']) {
                    storj.deleteFile(bucketId, result[i]['id'], function (err, result) {});
                }
            }
            fs.appendFile(filePath, req.body.data, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    storj.storeFile(bucketId, filePath, {
                        filename: filePath,
                        progressCallback: function progressCallback(progress, downloadedBytes, totalBytes) {
                            console.log('progress:', progress);
                        },
                        finishedCallback: function finishedCallback(err, fileId) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log('File complete:', fileId);
                            fs.unlink(filePath);
                            res.json({ fileID: fileId });
                        }
                    });
                }
            });
        });
    });

    api.get('/download/:fileid/', function (req, res) {
        console.log('fuck me');
        console.log(req.params.fileid);
        var filePath = __dirname + '/test.js';
        fs.stat(filePath, function (err, result) {
            console.log('unlink file first');
            if (err == null) {
                fs.unlink(filePath);
            }
            var state = storj.resolveFile(bucketId, req.params.fileid, filePath, {
                progressCallback: function progressCallback(progress, downloadedBytes, totalBytes) {},
                finishedCallback: function finishedCallback(err) {
                    if (err) {
                        return console.error(err);
                    } else {
                        fs.readFile(filePath, 'utf8', function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            res.json({ data: data });
                        });
                    }
                    console.log('File download complete');
                }
            });
        });
    });

    return api;
};
//# sourceMappingURL=index.js.map
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
var filename = 'health-data.json';

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
    // console.log(req.body.data);
    // SAVE THE DATA AND SEND THE FILE TO STORJ
    // TODO: Randomize the file name or use stream in Storj.io
    var filePath = __dirname + '/data.txt';
    var fs = require('fs');
    fs.writeFile(filePath, req.body, function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });

    storj.storeFile(bucketId, filePath, {
      filename: filename,
      progressCallback: function progressCallback(progress, downloadedBytes, totalBytes) {
        console.log('progress:', progress);
      },
      finishedCallback: function finishedCallback(err, fileId) {
        if (err) {
          return console.error(err);
        }
        console.log('File complete:', fileId);
      }
    });
    fs.unlink(filePath);
    res.json({ data: 'halo' });
  });

  api.get('/download/', function (req, res) {
    var fileId = '998960317b6725a3f8080c2b';
    var downloadFilePath = './' + filename;

    var state = storj.resolveFile(bucketId, fileId, downloadFilePath, {
      progressCallback: function progressCallback(progress, downloadedBytes, totalBytes) {
        console.log('progress:', progress);
      },
      finishedCallback: function finishedCallback(err) {
        if (err) {
          return console.error(err);
        }
        console.log('File download complete');
      }
    });
  });

  return api;
};
//# sourceMappingURL=index.js.map
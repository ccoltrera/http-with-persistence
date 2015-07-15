var fs = require("fs");
var url = require("url");
var express = require("express");
var app = express();

function usernameFinder(inputURL) {
  var pathname = url.parse(inputURL).pathname;
  var username = pathname.slice(10);
  return username;
}

app.route("/api/user/*")
  .get(function(req, res, next) {
    var username = usernameFinder(req.url);
    var readstream = fs.createReadStream(__dirname + "/data/" + username + ".json");
    readstream.on("open", function() {
      res.set('Content-Type', 'application/json');
      readstream.pipe(res);
    });
    readstream.on("error", function(err) {
      res.sendStatus(404);
    });
    // fs.readFile(__dirname + "/data/" + username + ".json", function(err,data) {
    //   if (err) {
    //     res.sendStatus(404);
    //   } else {
    //     var dataJSON = JSON.parse(data.toString());
    //     res.json(dataJSON);
    //   }
    // });
  })
  .post(function(req, res, next) {
    var username = usernameFinder(req.url);
    var filePath = __dirname + "/data/" + username + ".json";
    fs.open(filePath, 'r', function(err, data) {
      if (err) {
        res.sendStatus(201);
      } else {
        res.sendStatus(409);
      }
    });
  });

module.exports = app;

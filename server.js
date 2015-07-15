var fs = require("fs");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser")
var app = express();

app.use(bodyParser.json());

app.route("/api/user/:id")
  .get(function(req, res, next) {
    var readstream = fs.createReadStream(__dirname + "/data/" + req.params.id + ".json");
    readstream.on("open", function() {
      res.set('Content-Type', 'application/json');
      readstream.pipe(res);
    });
    readstream.on("error", function(err) {
      console.log(err);
      res.sendStatus(404);
    });
  })
  .post(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    fs.open(filePath, 'r', function(err, data) {
      if (err) {
        fs.open(filePath, "w", function(err, fd) {
          if (err) {
            res.sendStatus(500);
          } else {
            fs.write(fd, JSON.stringify(req.body), function(err, written, string) {
              if (err) {
                res.sendStatus(500);
              } else {
                res.sendStatus(201);
              }
            });
          }
        });
      } else {
        res.sendStatus(409);
      }
    });
  })
  .put(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    fs.open(filePath, "w", function(err, fd) {

    });
  });

// app.listen(8080, function() {
//   console.log("Server runnnig on 8080")
// });

module.exports = app;

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
    fs.open(filePath, "r+", function(err, fd) {
      if (err) {
        res.sendStatus(400);
      } else {
        fs.writeFile(filePath, JSON.stringify(req.body), function(err) {
          if (err) {
            res.sendStatus(500);
          } else {
            res.sendStatus(200);
          }
        });
      }
    });
  })
  .patch(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    fs.open(filePath, "r+", function(err, fd) {
      if (err) {
        res.sendStatus(400);
      } else {
        fs.readFile(filePath, function(err, data) {
          var userObject = JSON.parse(data.toString());
          var userUpdate = req.body;
          for (var each in userUpdate) {
            userObject[each] = userUpdate[each];
          }
          fs.writeFile(filePath, JSON.stringify(userObject), function(err) {
            if (err) {
              res.sendStatus(500);
            } else {
              res.sendStatus(200);
            }
          });
        });
      }
    });
  })
  .delete(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    fs.unlink(filePath, function(err) {
      if (err) {
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    });
  });

module.exports = app;

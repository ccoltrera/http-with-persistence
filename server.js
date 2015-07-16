var fs = require("fs");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());

//App only handles requests to /api/user/username
app.route("/api/users/:id")
  //GET == READ
  .get(function(req, res, next) {
    //Attempts to create a read stream, to be used to stream resource to client
    var readstream = fs.createReadStream(__dirname + "/data/" + req.params.id + ".json");
    //Successful open, pipes the data
    readstream.on("open", function() {
      res.set('Content-Type', 'application/json');
      readstream.pipe(res);
    });
    //If there's an error, sends a 404 (not found)
    readstream.on("error", function(err) {
      res.sendStatus(404);
    });
  })
  //POST == CREATE
  .post(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    //Attempts to open file with 'r' flag. An error means the resource does not yet exist
    fs.open(filePath, 'r', function(err, data) {
      //If it errors, file does not already exist and request can continue
      if (err) {
        //Creates a new file in the data/ directory
        fs.open(filePath, "w", function(err, fd) {
          //Errors on server side result in sending 500 (internal error)
          if (err) {
            res.sendStatus(500);
            //Else the sent JSON is written to new file
          } else {
            fs.write(fd, JSON.stringify(req.body), function(err, written, string) {
              if (err) {
                res.sendStatus(500);
                //On success, sends 201 (created)
              } else {
                res.sendStatus(201);
              }
            });
          }
        });
        //If the file exists, sends a 409 (conflict)
      } else {
        res.sendStatus(409);
      }
    });
  })
  //PUT == UPDATE (with complete overwrite) or CREATE (if resource does not exist)
  .put(function(req, res, next) {
    var filePath = __dirname + "/data/" + req.params.id + ".json";
    //Checks if file exists, so that correct status code can be sent (200 if raplaced, 201 if created)
    fs.open(filePath, "r", function(err, fd) {
      if (err) {
        fs.writeFile(filePath, JSON.stringify(req.body), function(err) {
          if (err) {
            res.sendStatus(500);
          } else {
            res.sendStatus(201);
          }
        });
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
  //PATCH == UPDATE (without complete overwrite)
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
  //DELETE == DESTROY
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

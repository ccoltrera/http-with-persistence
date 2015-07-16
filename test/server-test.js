"use strict";
var app = require("../server");

var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var fs = require("fs");

chai.use(chaiHttp);

describe("Persistant Server", function() {
  //Data to be used by tests below
  var colinData = {
    "username" : "colincolt",
    "name" : "Colin Colt",
    "birthDate" : 01011990,
    "email" : "c.colt@gmail.com",
    "emailconfirmed" : true
  }
  var marcData = {
    "username" : "marccolt",
    "name" : "Marc Colt",
    "birthDate" : 12021955,
    "email" : "m.colt@gmail.com",
    "emailconfirmed" : true
  };
  var anneData = {
    "username" : "annebuch",
    "name" : "Anne Buch",
    "birthDate" : 08171955,
    "email" : "a.buch@gmail.com",
    "emailconfirmed" : false
  };
  var anneUpdated = {
    "username" : "annebuch",
    "name" : "Anne Buch",
    "birthDate" : 08171955,
    "email" : "a.buch@gmail.com",
    "emailconfirmed" : true
  }
  //Define serverInstance outside of before() scope so that it can be closed later.
  var serverInstance;
  //Start server
  before(function(done) {
    serverInstance = app.listen(8080, function() {
      done();
    });
  });
  //Create necessary files
  before(function(done) {
    fs.writeFile("./data/colincolt.json", JSON.stringify(colinData), function(err) {
      done();
    });
  });
  before(function(done) {
    fs.writeFile("./data/annebuch.json", JSON.stringify(anneData), function() {
      done();
    });
  });
  //Shutdown server
  after(function(done) {
    serverInstance.close();
    done();
  });
  //Delete created files
  after(function(done) {
    fs.unlink("./data/colincolt.json", function(err) {
      done();
    });
  });
  after(function(done) {
    fs.unlink("./data/annebuch.json", function(err) {
      done();
    });
  });

  describe("GET request", function() {
    it("should respond to GET at /api/user/username for non-existing user with 404 status code", function(done) {
      chai.request("http://localhost:8080")
        .get("/api/user/erincolt")
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
    it("should respond to GET at /api/user/username for existing user with JSON file", function(done) {
      chai.request("http://localhost:8080")
        .get("/api/user/colincolt")
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
    });
  });

  describe("POST request", function() {
    after(function(done) {
      fs.unlink("./data/marccolt.json", function() {
        done();
      });
    });
    it("should respond with 409 (conflict) on POST where resource already exists", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/colincolt")
        .send(marcData)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          done();
        });
    });
    it("should create a file (username.json) in data directory on POST where no resource, send 201 (created)", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/marccolt")
        .send(marcData)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          fs.readFile("./data/marccolt.json", function(err, data) {
            expect(data.toString()).to.equal(JSON.stringify(marcData));
            done();
          });
        });
    });
  });

  describe("PUT request", function() {
    it("should respond with 400 (bad request) on PUT where resource does not exist", function(done) {
      chai.request("http://localhost:8080")
        .put("/api/user/erincolt")
        .send({"username":"erincolt"})
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });
    it("should respond with 200, and overwrite the resource, on PUT where resource exists", function(done) {
      chai.request("http://localhost:8080")
        .put("/api/user/annebuch")
        .send(anneData)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          fs.readFile("./data/annebuch.json", function(err, data) {
            expect(data.toString()).to.equal(JSON.stringify(anneData));
            done();
          });
        });
    });
  });

  describe("PATCH request", function() {
    it("should respond with 400 (bad request) on PATCH where resource does not exist", function(done) {
      chai.request("http://localhost:8080")
        .patch("/api/user/erincolt")
        .send({"emailconfirmed":true})
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });
    it("should respond with 200, and update the resource, on PATCH where resource exists", function(done) {
      chai.request("http://localhost:8080")
        .patch("/api/user/annebuch")
        .send({"emailconfirmed":true})
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          fs.readFile("./data/annebuch.json", function(err, data) {
            expect(data.toString()).to.equal(JSON.stringify(anneUpdated));
            done();
          });
        });
    });
  });

  describe("DELETE request", function() {
    before(function(done) {
      fs.writeFile("./data/sarahshel.json", JSON.stringify({"username":"sarahshel"}), function() {
        done();
      });
    });
    it("should respond with 400 (bad request) on DELETE where resource does not exist", function(done) {
      chai.request("http://localhost:8080")
        .del("/api/user/erincolt")
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });
    it("should delete resource, and respond with 200, on DELETE where resource exists", function(done) {
      chai.request("http://localhost:8080")
        .del("/api/user/sarahshel")
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          fs.readFile("./data/sarahshel.json", function(err, data) {
            expect(err.code).to.equal("ENOENT");
            done();
          });
        });
      });
  });
});

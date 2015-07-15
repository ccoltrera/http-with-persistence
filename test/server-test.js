"use strict";
var app = require("../server");

var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var fs = require("fs");

chai.use(chaiHttp);

describe("server", function() {
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
  var anneUpdate = {
    "username" : "annebuch",
    "name" : "Anne Buch",
    "birthDate" : 08171955,
    "email" : "a.buch@gmail.com",
    "emailconfirmed" : true
  }
  before(function(done) {
    app.listen(8080, function() {
      done();
    });
  });
  describe("get request", function() {
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
  describe("post request", function() {
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
  describe("put request", function() {
    after(function(done) {
      fs.writeFile("./data/annebuch.json", "{}", function() {
        done();
      });
    });
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
  describe("patch request", function() {
    before(function(done) {
      fs.writeFile("./data/annebuch.json", JSON.stringify(anneData), function() {
        done();
      });
    });
    after(function(done) {
      fs.writeFile("./data/annebuch.json", "{}", function() {
        done();
      });
    });
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
            expect(data.toString()).to.equal(JSON.stringify(anneUpdate));
            done();
          });
        });
    });
  });
  describe("delete request", function() {
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

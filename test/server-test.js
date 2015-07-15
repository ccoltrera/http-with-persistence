"use strict";
var app = require("../server");

var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var fs = require("fs");

chai.use(chaiHttp);

describe("server", function() {
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
    var postJSON = {
      "username" : "marccolt",
      "name" : "Marc Colt",
      "birthDate" : 12021955,
      "email" : "m.colt@gmail.com",
      "emailconfirmed" : true
    }
    after(function(done) {
      fs.unlink("./data/marccolt.json", function() {
        done();
      });
    });
    it("should respond with 409 (conflict) on POST where resource already exists", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/colincolt")
        .send(postJSON)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          done();
        });
    });
    it("should create a file (username.json) in data directory on POST where no resource, send 201 (created)", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/marccolt")
        .send(postJSON)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          fs.readFile("./data/marccolt.json", function(fsErr, data) {
            expect(fsErr).to.be.null;
            expect(data.toString()).to.equal(JSON.stringify(postJSON));
            done();
          });
        });
    });
  });
  // describe("put request", function() {
  //   it("should respond with 400 (bad request) on PUT where resource does not exist" function(done) {
  //     chai.request("http://localhost:8080")
  //       .put("/api/user/erincolt")
  //       .send({"username":"erincolt"})
  //       .end(function(err, res) {
  //         expect(err).to.be.null;
  //         expect(res).to.have.status(400)
  //         done();
  //       });

  //   });
  // });
});

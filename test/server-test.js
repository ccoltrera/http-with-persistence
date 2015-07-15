"use strict";
var app = require("../server");

var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;

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
    it("should respond with 409 (conflict) on POST where associated resource already exists", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/colincolt")
        .send({
          "username" : "colincolt",
          "name" : "Colin Colt",
          "birthDate" : "01011990",
          "email" : "c.colt@gmail.com",
          "emailconfirmed" : true
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          done();
        });
    });
    it("should create a file (username.json) in the data directory on POST where resource does not exist", function(done) {
      chai.request("http://localhost:8080")
        .post("/api/user/marccoltrera")
        .send({
          "username" : "marccolt",
          "name" : "Marc Colt",
          "birthDate" : "12021955",
          "email" : "m.colt@gmail.com",
          "emailconfirmed" : true
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          done();
        });
    });
  });
});

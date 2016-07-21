var should = require('should');
var request = require('supertest');
var server = require('../../../app');

var mockSchemas = require('../mock_data/mock_schemas');
var targetSchemas = require('../mock_data/target_schemas');
var mockObjects = require('../mock_data/mock_objects');
//var objects22k = require('../mock_data/NE_22k_example.json');
//We can't send large object with supertest at this point
//Even if we could swagger will freeze when validating such a large schema, replace objects and schema by "something" to get threw this
// curl -X POST -H "Content-Type: application/json" --data '{"something":{"schema":{},"objects":"'$(cat NE_22k_example.json)'-"}}' http://10.30.90.174:9000/objects/validate

//SOLUTION (OLD: before param named file)
//curl -v -s --trace-ascii http_tracery @_NE_22k_example.json.gz -H "Content-Type: application/json" -H "Content-Encoding: gzip" -X POST http://10.30.90.174:9000/objects/gzipped/validate

//SOLUTION(NEW)
// $ cd test/api/gzip_data
// TRUE $ curl -F "file=@NE_111k.json.gz" http:10.30.90.174:9000/objects/gzipped/validate
// FALSE $ curl -F "file=@NE_111k_with_errors.json.gz" http:10.30.90.174:9000/objects/gzipped/validate
var objects22k = [{"_start": 123}, {"_start": 12223}];
var basic = {
  "required": [ "_start"]
};

describe('controllers', function () {

  describe('json_object', function () {

    describe('POST /object/validate', function () {

      it('should return an error 400 if body is missing', function (done) {

        request(server)
          .post('/object/validate')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function (err, res) {
            should.not.exist(err);
            //res.status.should.eql(400);
            done();
          });
      });

      it('should return an error 400 if schema is missing from body', function (done) {

        request(server)
          .post('/object/validate')
          .send({object: {}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return an error 422 if schema is an invalid json schema', function (done) {

        request(server)
          .post('/object/validate')
          .send({ schema: { "required": "yolo123"}, object: { yolo : 123}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(422)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body.code);
            should.exist(res.body.message);
            done();
          });
      });

      it('should accept master schema and a valid faceDetect object', function (done) {

        request(server)
          .post('/object/validate')
          .send({schema: targetSchemas.master, object: mockObjects.faceValid})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should accept multimedia_document_content schema and a valid faceDetect object', function (done) {

        request(server)
          .post('/object/validate')
          .send({schema: targetSchemas.multimedia_document_content, object: mockObjects.faceValid})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid: false, errors: [] } with multimedia_document_content schema and invalid faceDetect object', function (done) {

        request(server)
          .post('/object/validate')
          .send({schema: targetSchemas.multimedia_document_content, object: { yolo : 123}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            //TODO fix
            should.not.exist(err);
            should.exist(res.body.isValid);
            should.exist(res.body.errors);
            res.body.isValid.should.eql(false);
            done();
          });
      });

    });

    describe('POST /objects/validate', function () {

      it('should return { isValid : true } with objects22k', function (done) {
        request(server)
          .post('/objects/validate')
          .send({schema: basic, objects: objects22k})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            //should.not.exist(err);
            console.log(res.body);
            //res.body.isValid.should.eql(true);
            done();
          });
      });
    });

    describe('POST /objects/gzipped/validate', function () {

      it('should return { isValid : true } with 111k', function (done) {
        request(server)
          .post('/objects/gzipped/validate')
          .attach('file', './test/api/gzip_data/NE_111k.json.gz')
          //.send({schema: basic, objects: objects22k})
          //.set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            //console.log(res.body);
            res.body.isValid.should.eql(true);
            done();
          });
      });

      it('should return { isValid : false } with 111k_with_errors', function (done) {
        request(server)
          .post('/objects/gzipped/validate')
          .attach('file', './test/api/gzip_data/NE_111k_with_errors.json.gz')
          //.send({schema: basic, objects: objects22k})
          //.set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            //console.log(res.body);
            res.body.isValid.should.eql(false);
            done();
          });
      });
    });

  });

});

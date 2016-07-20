var should = require('should');
var request = require('supertest');
var server = require('../../../app');

var mockSchemas = require('../mock_data/mock_schemas');
var targetSchemas = require('../mock_data/target_schemas');
var mockObjects = require('../mock_data/mock_objects');

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

  });

});

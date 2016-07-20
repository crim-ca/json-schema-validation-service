var should = require('should');
var request = require('supertest');
var server = require('../../../app');

var mockSchemas = require('../mock_data/mock_schemas');
var targetSchemas = require('../mock_data/target_schemas');
var mockObjects = require('../mock_data/mock_objects');

describe('controllers', function () {

  describe('json_object', function () {

    describe('POST /object/validate', function () {

      it('should return an error if body is missing', function (done) {

        request(server)
          .post('/object/validate')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.exist(err);
            done();
          });
      });

      it('should return an error if schema is missing from body', function (done) {

        request(server)
          .post('/object/validate')
          .send({object: {}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.exist(err);
            done();
          });
      });

      it('should accept master schema and valid faceDetect object', function (done) {

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

      it('should accept multimedia_document_content schema and valid faceDetect object', function (done) {

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

      it('should refuse multimedia_document_content schema and invalid faceDetect object', function (done) {

        request(server)
          .post('/object/validate')
          .send({schema: { schema: targetSchemas.multimedia_document_content, object: { yolo : 123}}})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.exist(err);
            res.body.should.not.eql({ isValid: true });
            done();
          });
      });

    });

  });

});

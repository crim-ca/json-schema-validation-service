var should = require('should');
var request = require('supertest');
var server = require('../../../app');

const masterSchema = require('../../../data/mockSchemas/master.json');
const faceDetectValidObject = require('../../../data/mockObjects/face_detect_valid.json');
const faceDetectNotValidObject = require('../../../data/mockObjects/face_detect_invalid.json');
const textDocumentSurfaceSchema = require('../../../data/targetSchemas/document_surface1d.json');
const tokenValidObject = require('../../../data/mockObjects/token_valid.json');
const tokenNotValidObject = require('../../../data/mockObjects/token_invalid.json');
const basicSchema = require('../../../data/batch/schemas/basic.json');
const NE10ValidObjects = require('../../../data/batch/objects/NE_10_objects.json');
const NE10NotValidObjects = require('../../../data/batch/objects/NE_10_objects_with_errors.json');

//BATCH ARRAY VALIDATION:
// 1- We can't send large object with supertest at this point (POST objects/validate is for small arrays)
//    Even if we could swagger will freeze when validating such a large dataset, replace objects and schema by "something" to get threw this
//    Following CURL will fail but this is an example:
//    $ curl -X POST -H "Content-Type: application/json" --data '{"something":{"schema":{},"objects":"'$(cat NE_22k_example.json)'-"}}' http://10.30.90.174:9000/objects/validate
//
// 2- To send large number of object use the POST objects/gzipped/validate and attach to it a gzipped json file containing {schema: {} and objects: []}
//    Following curl was used at some point before sending multipart/form-data and a param named "file"
//    $ curl -v -s --trace-ascii http_tracery @_NE_22k_example.json.gz -H "Content-Type: application/json" -H "Content-Encoding: gzip" -X POST http://10.30.90.174:9000/objects/gzipped/validate
//
// 3- Method POST objects/gzipped/valdiate now attends multipart/form-data so we can retreive file inside the express api
//    Both following curls commands actually should still works
//    TRUE <= $ curl -F "file=@NE_111k.json.gz" http:10.30.90.174:9000/objects/gzipped/validate
//    FALSE <= $ curl -F "file=@NE_111k_with_errors.json.gz" http:10.30.90.174:9000/objects/gzipped/validate
//    But now supertest method attach() support attached files with multipart/form-data so curl are kinda useless

describe('controllers', function () {

  describe('json_object', function () {

    describe('POST /object/validate', function () {

      it('should return an error 400 if body is missing', function (done) {

        request(server)
          .post('/psc-schema-validation-service/object/validate')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return an error 400 if schema is missing from body', function (done) {

        request(server)
          .post('/psc-schema-validation-service/object/validate')
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
          .post('/psc-schema-validation-service/object/validate')
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
          .post('/psc-schema-validation-service/object/validate')
          .send({schema: masterSchema, object: faceDetectValidObject})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should accept master schema and a valid token object', function (done) {

        request(server)
          .post('/psc-schema-validation-service/object/validate')
          .send({schema: masterSchema, object: tokenValidObject})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should accept document_surface1d schema and a valid token object', function (done) {

        request(server)
          .post('/psc-schema-validation-service/object/validate')
          .send({schema: textDocumentSurfaceSchema, object: tokenValidObject})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid: false, errors: [] } with document_surface1d schema and an invalid token object', function (done) {

        request(server)
          .post('/psc-schema-validation-service/object/validate')
          .send({schema: textDocumentSurfaceSchema, object: tokenNotValidObject})
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

      it('should return { isValid : true } with NE10ValidObjects.data', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/validate')
          .send({schema: basicSchema, objects: NE10ValidObjects.data})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(true);
            done();
          });
      });

      it('should return { isValid : false } with NE10NotValidObjects.data', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/validate')
          .send({schema: basicSchema, objects: NE10NotValidObjects.data})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(false);
            done();
          });
      });
    });

    describe('POST /objects/gzipped/validate', function () {

      it('should return { isValid : true } with NE_22k', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_22k.json.gz')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(true);
            done();
          });
      });

      it('should return { isValid : false } with NE_22k_with_errors', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_22k_with_error.json.gz')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(false);
            done();
          });
      });

      it('should return 400 with NE_22k_missing_schema', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_22k_missing_schema.json.gz')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return 422 with NE_22k_invalid_schema', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_22k_invalid_schema.json.gz')
          .expect('Content-Type', /json/)
          .expect(422)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return { isValid : true } with NE_111k', function (done) {
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_111k.json.gz')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(true);
            done();
          });
      });

      /*it('should return { isValid : true } with 111k_complex_schema', function (done) {
        this.timeout(50000);
        request(server)
          .post('/psc-schema-validation-service/objects/gzipped/validate')
          .attach('file', './data/batch/gzipped/NE_111k_complex_schema.json.gz')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.isValid.should.eql(false);
            done();
          });
      });*/
    });

  });

});

const should = require('should');
const request = require('supertest');
const chai = require('chai');
const server = require('../../../app');
const schemaController = require('../../../api/controllers/json_schema');
const pscSchema = require('../../../data/mockSchemas/test-psc.json');
const documentSchema = require('../../../data/targetSchemas/document.json');
const corpusSchema = require('../../../data/targetSchemas/corpus.json');
const textDocumentSurfaceSchema = require('../../../data/targetSchemas/document_surface1d.json');
const faceDetectNotValidSchema = require('../../../data/mockSchemas/face_detect_invalid.json');
const tokenSchema = require('../../../data/mockSchemas/token.json');
const tokenNotValidSchema = require('../../../data/mockSchemas/token_invalid.json');


describe('controllers', function () {

  describe('json_schema', function () {

    describe('Unit tests on json_schema controller', function () {

      it('should return true validateMetaschema with test-psc schema', function () {
        const resp = schemaController.validateMetaschema(pscSchema);
        resp.should.eql(true);

      });

      it('should return true validateTargetType with test-psc schema', function () {
        const resp = schemaController.validateTargetType(pscSchema);
        resp.should.eql(true);
      });

      it('should return true validateSubSchema with test-psc schema', function () {
        const resp = schemaController.validateSubSchema(pscSchema, documentSchema);
        resp.should.eql(true);
      });

      it('should return true validateSearchEngineConstraints with test-psc schema', function () {
        const resp = schemaController.validateSearchEngineConstraints(pscSchema);
        resp.should.eql(true);
      });

      it('should return true validatePscConstraints with test-psc schema', function () {
        const resp = schemaController.validatePscConstraints(pscSchema);
        resp.should.eql(true);
      });

      it('should return true isSupersetOfPrimitiveArray with ([], [])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray([], []);
        resp.should.eql(true);
      });

      it('should return false isSupersetOfPrimitiveArray with ([], ["12"])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray([], ["12"]);
        resp.should.eql(false);
      });

      it('should return false isSupersetOfPrimitiveArray with (["23"], ["12"]])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray(["23"], ["12"]);
        resp.should.eql(false);
      });

      it('should return true isSupersetOfPrimitiveArray with (["23"], []])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray(["23"], []);
        resp.should.eql(true);
      });

      it('should return true isSupersetOfPrimitiveArray with (["23"], ["23"])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray(["23"], ["23"]);
        resp.should.eql(true);
      });

      it('should return true isSupersetOfPrimitiveArray with (["23", "24"], ["23"])', function () {
        const resp = schemaController.isSupersetOfPrimitiveArray(["23", "24"], ["23"]);
        resp.should.eql(true);
      });

      it('should return true isSchemaOfSimpleList with list of integer', function () {
        let primitiveListSchema = {
            "type": "array",
            "items": { "type": "integer" }
        }
        const resp = schemaController.isSchemaOfSimpleList(primitiveListSchema)
        resp.should.eql(true);
      });

      it('should return true isSchemaOfSimpleList with list of flat objects', function () {
        let surface1dOffsetsSchema = {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "begin": {
                "type": "integer",
                "minimum": 0
              },
              "end": {
                "type": "integer",
                "minimum": 0
              }
            }
          }
        }
        const resp = schemaController.isSchemaOfSimpleList(surface1dOffsetsSchema)
        resp.should.eql(true);
      });

      it('should return false isSchemaOfSimpleList with list of nested objects', function () {
        let surface1dOffsetsSchema = {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "offsets": {
                "type": "object",
                "properties": {
                  "begin": {
                    "type": "integer",
                    "minimum": 0
                  },
                  "end": {
                    "type": "integer",
                    "minimum": 0
                  }
                }
              }
            }
          }
        }
        const resp = schemaController.isSchemaOfSimpleList(surface1dOffsetsSchema)
        resp.should.eql(false);
      });

      it('should return false isSchemaOfSimpleList with nested lists', function () {
        let surface1dOffsetsSchema = {
          "type": "array",
          "items": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "integer" }
          }
        }
        const resp = schemaController.isSchemaOfSimpleList(surface1dOffsetsSchema)
        resp.should.eql(false);
      });

    });

    describe('POST /schema/validate', function () {

      it('should return an error 400 if body is missing', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
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
          .post('/psc-schema-validation-service/schema/validate')
          .send({})
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
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: { "required" : "yolo" }})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(422)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return { isValid : true } if schema is psc-test schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: pscSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid : true } if schema is document schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: documentSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid : true } if schema is corpus schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: corpusSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid : true } if schema is document_surface1d schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: textDocumentSurfaceSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid : false } if schema is face_detect_invalid schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: faceDetectNotValidSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body.isValid);
            res.body.isValid.should.eql(false);
            done();
          });
      });

      it('should return { isValid : true } if schema is token schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: tokenSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.should.eql({ isValid: true });
            done();
          });
      });

      it('should return { isValid : false } if schema is token_invalid schema', function (done) {

        request(server)
          .post('/psc-schema-validation-service/schema/validate')
          .send({ schema: tokenNotValidSchema })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body.isValid);
            res.body.isValid.should.eql(false);
            done();
          });
      });

    });

  });

});

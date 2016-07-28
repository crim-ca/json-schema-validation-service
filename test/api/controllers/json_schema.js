const should = require('should');
const request = require('supertest');
const chai = require('chai');
const server = require('../../../app');
const Config = require('../../../config.json');
const schemaController = require('../../../api/controllers/json_schema');
const pscSchema = require('../../../data/mockSchemas/test-psc.json');
const documentSchema = require('../../../data/targetSchemas/document.json'); // += Config.targetSchemas.document


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

      //
      //console.log("validateTargetType", validateTargetType(mySchema));
      //
      //console.log("validateSubSchema", validateSubSchema(mySchema, myTargetSchema));
      //
      //console.log("validateSearchEngineConstraints", validateSearchEngineConstraints(mySchema));
      //
      //
      //// Global validation function
      //console.log("validatePscConstraints", validatePscConstraints(mySchema));



    });

    describe('POST /schema/validate', function () {

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
          .send({})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function (err, res) {
            should.not.exist(err);
            done();
          });
      });

    });

  });

});

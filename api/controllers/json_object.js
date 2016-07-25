'use strict';

var util = require('util'),
    Ajv = require('ajv'), //ajv validator
    zlib = require("zlib"); //gzip extract

module.exports = {
  validateObject: validateObject,
  validateArray: validateArray,
  validateBatchArray: validateBatchArray
};

function validateBatchArray(req, res) {
  var startingData = new Date();
  var file = req.swagger.params.file.originalValue.buffer;

  zlib.gunzip(file, function(err, dezipped) {
    var obj = JSON.parse(dezipped);
    if(obj.schema &&  obj.objects){
      validadeAjvArray(obj.schema, obj.objects, function(json, status){
        var endingDate = new Date();
        console.log("Completed " + obj.objects.length + " objects in " + (endingDate - startingData) + "ms");
        res.status(status);
        res.json(json);
      });
    }else{
      //Arguments validation normally executed by swagger but not in this case
      var errors = [];
      if(!obj.schema){
        errors.push({
          "code": "OBJECT_MISSING_REQUIRED_PROPERTY",
          "message": "Missing required property: schema",
          "path": []
        });
      }
      if(!obj.objects){
        errors.push({
          "code": "OBJECT_MISSING_REQUIRED_PROPERTY",
          "message": "Missing required property: objects",
          "path": []
        });
      }
      //400: Bad request: a required argument is missing
      res.status(400);
      res.json({
        "message": "Request validation failed: Parameter (body) failed schema validation",
        "code": "AJV_OBJECT_VALIDATION_FAILED",
        "failedValidation": true,
        "results": {
          "errors": errors,
          "warnings": []
        }
      });
    }
  });
}

function validateArray(req, res) {
  var startingData = new Date();
  const objects = req.swagger.params.body.originalValue.objects;
  //const objects = require('../../test/api/mock_data/NE_22k_example_with_error.json').data;
  const schema = req.swagger.params.body.originalValue.schema;

  validadeAjvArray(schema, objects, function(json, status){
    var endingDate = new Date();
    console.log("Completed " + objects.length + " objects in " + (endingDate - startingData) + "ms");
    res.status(status);
    res.json(json);
  });
}

function validateObject(req, res) {
  const object = req.swagger.params.body.originalValue.object;
  const schema = req.swagger.params.body.originalValue.schema;

  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true, v5: true}
  var validate;
  try {
    validate = ajv.compile(schema);
    validateAjvObject(object, validate, function(json, status){
      res.status(status);
      res.json(json);
    });
  } catch (err) {
    //422: Unprocessable Entity: JSON Schema is not valid
    res.status(422);
    res.json({
      "message": "Ajv " + err,
      "code": "AJV_SCHEMA_VALIDATION_FAILED",
      "failedValidation": true
    });
  }
}

function validateAjvObject(object, validate, callback){
  var json = {},
    status = 200,
    valid;
  try {
    valid = validate(object);

    if (!valid){
      json = {
        "isValid": false,
        "errors": validate.errors
      };
    }else{
      json = {
        "isValid": true
      };
    }
  } catch (err) {
    //422: Unprocessable Entity: JSON Object might also not be valid but this should never happen
    status = 422;
    json ={
      "message": "Ajv " + err,
      "code": "AJV_OBJECT_VALIDATION_FAILED",
      "failedValidation": true
    };
  }
  callback(json, status);
}

function validadeAjvArray(schema, objects, callback){
  var ajv = new Ajv(),
    validate,
    json = {},
    status = 200,
    errors = [],
    valid;

  try {
    validate = ajv.compile(schema);
    loopArray();
  } catch (err) {
    //422: Unprocessable Entity: JSON Schema is not valid
    status = 422;
    json = {
      "message": "Ajv " + err,
      "code": "AJV_SCHEMA_VALIDATION_FAILED",
      "failedValidation": true
    };
    callback(json, status);
  }

  function loopArray(){
    if(objects.length){
      objects.forEach(function(object, i){
        valid = validate(object);
        if(!valid){
          console.log("Ajv Error found for object " + i);
          var current = validate.errors;
          current[0].number = i;
          errors = errors.concat(current);
        }
      });
    }

    if (errors.length){
      json = {
        "isValid": false,
        "errors": errors
      };
    }else{
      json = {
        "isValid": true
      };
    }
    callback(json, status);
  }
}


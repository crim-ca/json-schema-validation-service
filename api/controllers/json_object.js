'use strict';

var util = require('util'),
    Ajv = require('ajv'),
    zlib = require("zlib");

module.exports = {
  validateObject: validateObject,
  validateArray: validateArray,
  validateBatchArray: validateBatchArray
};

function validateBatchArray(req, res) {
  var date1 = new Date();
  var file = req.swagger.params.file.originalValue.buffer;

  zlib.gunzip(file, function(err, dezipped) {
    var obj = JSON.parse(dezipped)
    validadeAjvArray(res, obj.schema, obj.objects, date1);
  });
}

function validateArray(req, res) {
  var date1 = new Date();
  const objects = req.swagger.params.body.originalValue.objects;
  //const objects = require('../../test/api/mock_data/NE_22k_example_with_error.json').data;
  const schema = req.swagger.params.body.originalValue.schema;

  validadeAjvArray(res, schema, objects, date1);
}

function validadeAjvArray(res, schema, objects, date1){
  //TODO
  var ajv = new Ajv();
  var validate = ajv.compile(schema);
  //var objects = require('../../test/api/mock_data/NE_22k_example_with_error.json');
  var errors = [];
  var valid;

  if(objects.length){
    objects.forEach(function(object, i){
      valid = validate(object);
      if(!valid){
        //console.log("error found at " + i + validate.errors)
        var current = validate.errors;
        current[0].number = i;
        errors = errors.concat(current);
      }
    });
  }
  var date2 = new Date();
  //console.log(errors);
  console.log("Completed " + objects.length + " objects in " + (date2 - date1) + "ms");

  if (errors.length){
    res.json({
      "isValid": false,
      "errors": errors
    });
  }else{
    res.json({
      "isValid": true
    });
  }
}

function validateObject(req, res) {
  const object = req.swagger.params.body.originalValue.object;
  const schema = req.swagger.params.body.originalValue.schema;

  //console.log("Received Object:" + JSON.stringify(object));
  //console.log("Received Schema:" + JSON.stringify(schema));

  var ajv = new Ajv(/*{ v5: true}*/); // options can be passed, e.g. {allErrors: true}
  var validate;
  try {
    validate = ajv.compile(schema);
    validateAjvObject(object, validate);
  } catch (err) {
    //422: Unprocessable Entity: JSON Schema is not valid
    res.status(422);
    res.json({
      "message": "Ajv " + err,
      "code": "AJV_SCHEMA_VALIDATION_FAILED",
      "failedValidation": true
    });
  }

  function validateAjvObject(object, validate){
    var result = {},
        valid;
    try {
      valid = validate(object);

      if (!valid){
        res.json({
          "isValid": false,
          "errors": validate.errors //valid.errors
        });
      }else{
        res.json({
          "isValid": true
        });
      }
    } catch (err) {
      //422: Unprocessable Entity: JSON Object might also not be valid but this should never happen
      res.status(422);
      res.json({
        "message": "Ajv " + err,
        "code": "AJV_OBJECT_VALIDATION_FAILED",
        "failedValidation": true
      });
    }
  }



}


'use strict';

var util = require('util');
var Ajv = require('ajv');

module.exports = {
  validateObject: validateObject,
  validateArray: validateArray
};

function validateArray(req, res) {
  const objects = req.swagger.params.body.schema.objects;
  const schema = req.swagger.params.body.schema.schema;

  //TODO

  res.json(util.format(true));
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
  } catch (err) {
    //422: Unprocessable Entity: JSON Schema is not valid
    res.status(422);
    res.json({
      "message": "Ajv " + err,
      "code": "AJV_SCHEMA_VALIDATION_FAILED",
      "failedValidation": true
    });
  }

  try {
    var valid = validate(object);

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


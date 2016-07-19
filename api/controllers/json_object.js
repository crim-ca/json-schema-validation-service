'use strict';

var util = require('util');

module.exports = {
    validate: validate
};

function validate(req, res) {
    const object = req.swagger.params.body.schema.object;
    const schema = req.swagger.params.body.schema.schema;
    //console.log("YOLO:" + JSON.stringify(req.swagger.params.body.schema.schema));
    
    //TODO Call AJV
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    //var name = req.swagger.params.name.value || 'stranger';
    var hello = util.format('Hello, %s!', 'YOLO');

    // this sends back a JSON response which is a single string
    res.json(hello);
}

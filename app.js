'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var express = require('express');
var router = express.Router();

var app = express();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) {
    throw err;
  }
  var bodyParser = require('body-parser');

  //Deny access to original path and force the proxy route
  var proxy = require('path-prefix-proxy')('/psc-schema-validation-service');
  app.use('/psc-schema-validation-service', proxy);
  app.use(proxy.denyUnproxied);

  app.use(bodyParser.json({limit: '150mb'}));
  app.use(SwaggerUi(swaggerExpress.runner.swagger));

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 9000;
  var host = process.env.HOST || 'localhost';
  app.listen(port, host);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://' + host + ':' + port + '/hello?name=Scott');
  }
});

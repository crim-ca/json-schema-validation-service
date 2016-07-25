## JSON Schema Validation service ##

- This service validates a json object based on a JSON schema.
- JSON schema will be validated as well based on draft/v4 or any meta-schema inheriting draft/v4
- You can extend the service to force custom fields and custom validation on the input JSON Schema

## Tech stack ##

- NodeJS 6.2.2+
- NPM 3.8.9+
- Express: https://github.com/expressjs/express
- Swagger: https://github.com/swagger-api/swagger-node
- SwaggerUI: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-ui
- ajv: https://github.com/epoberezkin/ajv

## Install, test and execute ##
Prerequisites : NodeJS 6.2.2+ & NPM 3.8.9+
```bash
npm install
npm test
npm start
```
```bash
npm install swagger -g
swagger project verify # Verify project can be executed
swagger project test # Run unit tests on every routes
swagger project start
```

Then open browser on localhost:9000/docs to see documentation of the current API
Or target API method threw its exposed routes (Ex. POST http://localhost:9000/object/validate)

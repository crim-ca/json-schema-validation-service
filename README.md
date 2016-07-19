## JSON Schema Service validator ##

This service validates a json object based on a json schema. JSON schema will be validated as well based on draft/v4 or any custom schema based on draft/v4

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
npm install swagger -g
npm install
swagger project verify # Verify project can be executed
swagger project test # Run unit tests on every routes
swagger project start
```
Then open browser on localhost:9000/docs to see SwaggerUI
Or target API threw its exposed routes (Ex. POST http://10.30.90.174:9000/json_object)

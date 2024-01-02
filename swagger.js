const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Displayeo — CORE API',
      version: '1.0.0'
    }
  },
  apis: ['./src/api/**/*.ts']
};
const result = swaggerJsdoc(options);

module.exports = result;

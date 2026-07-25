const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flick API Documentation',
      version: '1.0.0',
      description: 'API documentation for Flick application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.flick.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management and authentication endpoints',
      },
      {
        name: 'Roles',
        description: 'Role management endpoints (SuperAdmin only)',
      },
      {
        name: 'Rider',
        description: 'Rider registration and profile management',
      },
      {
        name: 'Rides',
        description: 'Ride booking, tracking, and management',
      },
      {
        name: 'Conversations',
        description: 'Chat conversation management',
      },
      {
        name: 'Filters',
        description: 'Dynamic data filtering system',
      },
      {
        name: 'Admin',
        description: 'Admin dashboard and management endpoints',
      },
    ],
  },
  apis: ['./src/Documentation/**/*.js', './src/Models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

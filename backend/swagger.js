import swaggerJSDoc from 'swagger-jsdoc'

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crowsnest API',
      version: '1.0.0',
      description: 'Auto-generated reference for the Crowsnest backend endpoints.',
    },
    servers: [{ url: '/' }],
  },
  apis: ['./server.js'],
})

export default swaggerSpec

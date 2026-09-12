import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Baby Toys Store API",
      version: "1.0.0",
      description: "REST API documentation for the Baby Toys E-Commerce Platform (ULT Technology MERN Internship Project)",
    },
    servers: [
      { url: "https://baby-toy-store-production.up.railway.app/api", description: "Production" },
      { url: "http://localhost:5000/api", description: "Local development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"], // JSDoc comments in route files banayenge documentation
};

export const swaggerSpec = swaggerJsdoc(options);
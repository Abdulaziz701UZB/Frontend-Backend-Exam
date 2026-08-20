import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EduControl CRM - O'quv Markazini Boshqarish API",
      version: "1.0.0",
      description: "EduControl platformasining barcha 10 ta CRM modullari uchun to'liq interaktiv REST API hujjatlari va PostgreSQL ulanishi.",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Asosiy API Serveri",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "EduControl API Documentation",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );
};

export default setupSwagger;

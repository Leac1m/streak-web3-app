import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Streak API",
      version: "1.0.0",
      description: "API documentation"
    },
  },
  apis: [path.join(__dirname, "routes/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi.setup(swaggerSpec);
export const swaggerServe = swaggerUi.serve;

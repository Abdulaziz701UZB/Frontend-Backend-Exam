import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import setupSwagger from "./swagger/swagger.js";
import sequelize from "./config/database.js";
import { seedDatabase } from "./config/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VELNEX CRM API Server faol ishlamoqda",
    database: "PostgreSQL (Sequelize ORM) ulangan",
    swaggerDocs: "http://localhost:5000/api-docs",
    modulesCount: 11,
  });
});

app.listen(PORT, async () => {
  console.log(`VELNEX Backend server is running on http://localhost:${PORT}`);
  console.log(`Swagger API Documentation: http://localhost:${PORT}/api-docs`);
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedDatabase();
    console.log("PostgreSQL (Sequelize ORM) muvaffaqiyatli ulandi va ma'lumotlar sinxronlandi!");
  } catch (error) {
    console.log("Sequelize ulanish xatosi:", error.message);
  }
});

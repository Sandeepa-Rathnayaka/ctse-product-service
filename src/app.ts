import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import "express-async-errors";

import connectDB from "./config/db.config";
import logger from "./config/logger.config";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import notFoundMiddleware from "./middleware/notfound.middleware";
import errorHandlerMiddleware from "./middleware/errorhandler.middleware";

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8003", 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Product Service is running" });
});

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Error Handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start server
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Product Service is running on port ${PORT}🚀`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;

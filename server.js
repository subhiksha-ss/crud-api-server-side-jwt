const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const logger = require("./middleware/logger");
const requestTime = require("./middleware/requestTime");
const errorHandler = require("./middleware/errorHandler");

const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const app = express();

// middleware
app.use(express.json());
app.use(logger);
app.use(requestTime);

// connect to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ mongodb connected"))
  .catch(err => console.error("❌ mongodb connection error:", err));

// routes
app.use("/products", productsRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);

// root route
app.get("/", (req, res) => {
  res.send("server and mongodb connected!");
});

// error handler
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 server running on port ${PORT}`);
});

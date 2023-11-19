//require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config(); //{path: "./env"}
import { app } from "./app.js";

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port || 8000, () => {
      console.log(`server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("mongo db connection failed");
  });

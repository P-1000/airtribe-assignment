import express from "express";
import dotenv from "dotenv";
import instructorRouter from "./src/routes/instructorRoutes.js";
import courseRouter from "./src/routes/courseRoutes.js";
import leadRouter from "./src/routes/leadRoutes.js";
import { client } from "./config/db.js";
import { createError } from "./config/error.js";
import {fakerDataRouter} from "./data/fakedataRoute.js";
import { createTbl } from "./data/createTable.js";

dotenv.config();

const app = new express();
app.use(express.json());

//routes :
app.use("/instructors", instructorRouter);
app.use("/courses", courseRouter);
app.use("/leads", leadRouter);

app.use("/createTables", createTbl);
app.use("/fakedata", fakerDataRouter);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Airtribe running on port : " + process.env.PORT + "if Your running in docker use port 13000" });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  client
    .connect()
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log("Error connecting to database");
      createError(err, 500, "error", "Error connecting to database");
    });
});

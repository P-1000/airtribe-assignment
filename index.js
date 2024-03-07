import express from "express";
import dotenv from "dotenv";
import instructorRouter from "./src/routes/instructorRoutes.js";
import courseRouter from "./src/routes/courseRoutes.js";
import leadRouter from "./src/routes/leadRoutes.js";
import { client } from "./config/db.js";

dotenv.config();

const app = new express();
app.use(express.json());

//routes :
app.use("/instructors", instructorRouter);
app.use("/courses", courseRouter);
app.use('/leads', leadRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Airtribe running on port : " + process.env.PORT });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  client
    .connect()
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log("Error connecting to database", err);
    });
});

import express from "express";
import { instructor_data, course_data, lead_data } from "./DataLoad.js";

const fakerDataRouter = express.Router();

fakerDataRouter.get("/", async (req, res) => {
  try {
    await instructor_data();
    await course_data();
    await lead_data();

    res.status(200).json({ message: "Fake data inserted successfully" });
  } catch (error) {
    console.log(error);
  }
});

export { fakerDataRouter };

import express from "express";
import { applyForCourse , updateLead } from "../controllers/leadController.js";

const leadRouter = express.Router();

leadRouter.post("/apply/:course_id", applyForCourse);

leadRouter.patch("/update", updateLead);



export default leadRouter;

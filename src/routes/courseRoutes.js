import express from "express";
import {
  getAllCourses,
  getCoursesByName,
  createCourse,
  updateCourse,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/", getAllCourses);

courseRouter.get("/:name", getCoursesByName);

courseRouter.post("/create", createCourse);

courseRouter.put("/update/:id", updateCourse);

export default courseRouter;

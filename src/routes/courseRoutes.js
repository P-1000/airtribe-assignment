import express from "express";
import {
  getAllCourses,
  getCoursesByName,
  createCourse,
  updateCourse,
  getCourseDetails
} from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/", getAllCourses);

courseRouter.get("/:name", getCoursesByName);

courseRouter.post("/create", createCourse);

courseRouter.put("/update/:id", updateCourse);

courseRouter.get("/get/courseDetails" , getCourseDetails);

export default courseRouter;

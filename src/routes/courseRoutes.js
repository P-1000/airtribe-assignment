import express from "express";
import {
  getAllCourses,
  getCoursesByName,
  createCourse,
  updateCourse,
  getCourseDetails,
  getFullCourseDetails,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/", getAllCourses);

courseRouter.get("/get/name", getCoursesByName);

courseRouter.post("/create", createCourse);

courseRouter.put("/update/:id", updateCourse);

courseRouter.get("/get/courseDetails", getCourseDetails);

courseRouter.get("/get/fullDetails/:course_id", getFullCourseDetails);



export default courseRouter;

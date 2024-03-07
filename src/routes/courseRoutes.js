import express from "express";
import { getAllCourses , getCoursesByName , createCourse , updateCourse } from "../controllers/courseController.js";


const courseRouter = express.Router();


courseRouter.get('/' , getAllCourses);

courseRouter.get("/:name", getCoursesByName);

courseRouter.post('/create' , createCourse);

courseRouter.put("/:id", (req, res) => {
    res.status(200).json({ message: "Course updated" });
    });

courseRouter.post("/", (req, res) => {
    res.status(201).json({ message: "Course created" });
    });

courseRouter.put("/update/:id", updateCourse);

courseRouter.delete("/:id", (req, res) => {
    res.status(200).json({ message: "Course deleted" });
    });

export default courseRouter;
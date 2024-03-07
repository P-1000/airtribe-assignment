import {client} from "../config/db.js";

export const applyForCourse = async (req,res,next) =>{
    const {course_id , student_id} = req.body;
    const query  = `INSERT INTO course_registration`;
}
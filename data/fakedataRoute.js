import express from "express";
import { instructor_data, course_data, lead_data } from "./DataLoad.js";

const fakerDataRouter = express.Router();

export const LoadData = async ()=>{
    try {
        await instructor_data();
        await course_data();
        await lead_data();
    } catch (error) {
      next(error)
    }
}

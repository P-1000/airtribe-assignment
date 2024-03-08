import express from "express";
import { newInstructor , updateInstructor , getAllInstructors , getInstructorById  , deleteInstructor} from "../controllers/instructorController.js";

const instructorRouter = express.Router();


instructorRouter.post("/newInstructor", newInstructor);

instructorRouter.put("/updateInstructor/:id", updateInstructor);

instructorRouter.get('/getall',  getAllInstructors);

instructorRouter.get('/id/:id', getInstructorById);

instructorRouter.delete('/delete/:id',deleteInstructor);

export default instructorRouter;

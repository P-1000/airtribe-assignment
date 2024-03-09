import express from "express";
import {
  applyForCourse,
  updateLead,
  getLeadsByCourse,
  getAllLeads,
  getLeadbyId,
  getLeadByName,
  getLeadByEmail,
  addLeadComment,
  getLeadCommentsByLead,
  updateLeadComment,
} from "../controllers/leadController.js";

const leadRouter = express.Router();

leadRouter.get("/getAllLeads", getAllLeads);

leadRouter.post("/apply/:course_id", applyForCourse);

leadRouter.patch("/update", updateLead);

leadRouter.get("/getLeadByCourse/:course_id", getLeadsByCourse);

leadRouter.get("/getLead/:id", getLeadbyId);

leadRouter.get("/getLeadByName/:name", getLeadByName);

leadRouter.get("/getLeadByEmail", getLeadByEmail);

leadRouter.post("/add/leadcomments", addLeadComment);

leadRouter.get("/get/LeadComments/:id", getLeadCommentsByLead);

leadRouter.patch("/update/leadComment", updateLeadComment);

export default leadRouter;

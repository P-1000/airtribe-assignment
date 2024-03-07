import { client } from "../../config/db.js";
import { createError } from "../../config/error.js";

export const applyForCourse = async (req, res, next) => {
  const { course_id } = req.params;
  const { name, email, phone, linkedin_profile } = req.body;
  if (!course_id) {
    return next(createError(400, "Invalid input"));
  }
  if (!name || !email || !phone || !linkedin_profile) {
    return next(createError(400, "Invalid input"));
  }

  try {
    const checkQuery = `SELECT * FROM courses WHERE course_id = $1 AND start_date > now();`;
    const checkres = await client.query(checkQuery, [course_id]);
    if (checkres.rows.length === 0) {
      return next(createError(400, "Course does not exist or is not active"));
    }
  } catch (error) {
    next(createError(500, "Internal server error"));
  }

  try {
    const checkQuery = `SELECT * FROM leads WHERE email = $1 AND course_id = $2;`;
    const checkres = await client.query(checkQuery, [email, course_id]);
    if (checkres.rows.length > 0) {
      return next(createError(400, "You have already applied for this course"));
    }
  } catch (error) {
    next(createError(500, "Internal server error"));
  }

  const query = `INSERT INTO leads (course_id , name ,email , phone , linkedin_profile) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING * ;`;
  const values = [course_id, name, email, phone, linkedin_profile];
  try {
    const result = await client.query(query, values);
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};



export const updateLead = async (req, res, next) => {
  const { instructor_id, lead_id , status} = req.body;
  if (!instructor_id || !lead_id || !status) {
    return next(createError(400, "Invalid input"));
  }

  if(!status == "Accepted" || !status == "Rejected"){
    return next(createError(400, "Invalid status input"));
  }

  try {
    const checkQuery = `SELECT * FROM instructors WHERE instructor_id = $1;`;
    const checkres = await client.query(checkQuery, [instructor_id]);
    if (checkres.rows.length === 0) {
      return next(createError(400, "Instructor does not exist"));
    }
  } catch (error) {
    next(createError(500, "Internal server error"));
  }

  try {
    const checkQuery = `SELECT * FROM leads WHERE lead_id = $1;`;
    const checkres = await client.query(checkQuery, [lead_id]);
    if (checkres === 0) {
      return next(createError(400, "Lead does not exist"));
    }
  } catch (error) {
    next(createError(500, "Internal server error"));
  }

  try {
    const statusUpdateQuery = `UPDATE leads SET status = $1 where lead_id = $2 RETURNING *;`;
    const values = [status, lead_id];
    const result = await client.query(statusUpdateQuery, values);
    res.status(200).json({message: "Lead updated successfully" });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};




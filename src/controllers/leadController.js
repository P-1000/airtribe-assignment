import { client } from "../../config/db.js";
import { createError } from "../../config/error.js";
import {queries} from "../../queries/queries.js";


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
    next(createError(error.statusCode, error.message));
  }

  try {
    const checkQuery = `SELECT * FROM leads WHERE email = $1 AND course_id = $2;`;
    const checkres = await client.query(checkQuery, [email, course_id]);
    if (checkres.rows.length > 0) {
      return next(createError(400, "Lead already exists"));
    }
  } catch (error) {
    next(createError(500, "Internal server error"));
  }



  try {
    const result = await client.query(queries.putLead, values);

    const updateValues = [course_id];
    const updateResult = await client.query(queries.updateLeadCount, updateValues);
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

export const updateLead = async (req, res, next) => {
  const { instructor_id, lead_id, status } = req.body;

  if (!instructor_id || !lead_id) {
    return next(createError(400, "Invalid input"));
  }

  if (status && status !== "Accepted" && status !== "Rejected") {
    return next(createError(400, "Invalid status input"));
  }

  try {
    const instructorCheckRes = await client.query(queries.getInstructorById, [
      instructor_id,
    ]);
    if (instructorCheckRes.rows.length === 0) {
      return next(createError(400, "Instructor does not exist"));
    }
  } catch (error) {
    return next(createError(500, "Failed to check instructor"));
  }

  try {
    const leadCheckRes = await client.query(queries.getLeadById, [lead_id]);
    if (leadCheckRes.rows.length === 0) {
      res.status(400).json({ error: "Lead does not exist" });
    }
  } catch (error) {
    return next(createError(500, "Failed to check lead"));
  }

  try {
    const statusUpdateQuery = `UPDATE leads SET status = $1 WHERE lead_id = $2 RETURNING *;`;
    if (status === "Accepted") {
      const updateLeadCountsQuery = `
      UPDATE leadcounts
      SET pending_count = pending_count - 1, accepted_count = accepted_count + 1
      WHERE course_id = (SELECT course_id FROM leads WHERE lead_id = $1)
      RETURNING *;
    `;
      const updateValues = [lead_id];
      const updateResult = await client.query(
        updateLeadCountsQuery,
        updateValues
      );
    }
    if (status === "Rejected") {
      const updateLeadCountsQuery = `
      UPDATE leadcounts
      SET pending_count = pending_count - 1, rejected_count = rejected_count + 1
      WHERE course_id = (SELECT course_id FROM leads WHERE lead_id = $1)
      RETURNING *;
    `;
      const updateValues = [lead_id];
      const updateResult = await client.query(
        updateLeadCountsQuery,
        updateValues
      );
    }

    const values = [status, lead_id];
    const result = await client.query(statusUpdateQuery, values);
    res.status(200).json({ message: "Lead updated successfully" });
  } catch (error) {
    return next(createError(500, "Failed to update lead"));
  }
};

export const getLeadsByCourse = async (req, res, next) => {
  const { course_id } = req.params;
  if (!course_id) {
    return next(createError(400, "Invalid input"));
  }
  try {
    const checkQuery = `SELECT * FROM courses WHERE course_id = $1;`;
    const checkres = await client.query(checkQuery, [course_id]);
    if (checkres.rows.length === 0) {
      res.status(404).json({ error: "Course does not exist" });
    }
  } catch (error) {
    return next(createError());
  }

  try {
    const getLeadsQuery = `SELECT * FROM leads WHERE course_id = $1;`;
    const checkres = await client.query(getLeadsQuery, [course_id]);
    res.status(200).json({ leads: checkres.rows });
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    const getLeadsQuery = `SELECT * FROM leads;`;
    const getLeads = await client.query(getLeadsQuery);
    res.status(200).json(getLeads.rows);
  } catch (err) {
    next(createError(err.statusCode, err.message));
  }
};

export const getLeadbyId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(createError(400, "Invalid input"));
  }
  try {
    const getLeads = await client.query(queries.getLeadById, [id]);
    if (getLeads.rows.length === 0) {
      res.status(404).json({ error: "Lead does not exist" });
    }
    res.status(200).json({ lead: getLeads.rows[0] });
  } catch (error) {
    next(createError(error.statusCode, error.message));
  }
};

export const getLeadByName = async (req, res, next) => {
  const { name } = req.params;
  try {
    const getLeadsQuery = `SELECT * FROM leads WHERE similarity(name , $1) > 0.3;`;
    const getLeads = await client.query(getLeadsQuery, [name]);
    res.status(200).json({ leads: getLeads.rows });
  } catch (error) {
    next(createError());
  }
};

export const getLeadByEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(createError(400, "Invalid input"));
  }
  try {
    const getLeadsQuery = `SELECT * FROM leads WHERE similarity(email , $1) > 0.3;`;
    const getLeads = await client.query(getLeadsQuery, [email]);
    res.status(200).json(getLeads.rows);
  } catch (err) {
    next(createError(err.statusCode, err.message));
  }
};

export const addLeadComment = async (req, res, next) => {
  const { instructor_id, lead_id, comment } = req.body;
  if (!instructor_id || !lead_id || !comment) {
    return next(createError(400, "Invalid input"));
  }
  try {
    const instructorResult = await client.query(queries.getInstructorById, [
      instructor_id,
    ]);
    if (instructorResult.rows.length === 0) {
      return next(createError(404, "Instructor not found"));
    }
  } catch (err) {
    return next(createError(500, "Internal server error"));
  }
  try {
    const leadResult = await client.query(queries.getLeadById, [lead_id]);
    if (leadResult.rows.length === 0) {
      return next(createError(404, "Lead not found"));
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
  try {
    const commentQuery = `INSERT INTO LeadComments (instructor_id , lead_id , comment) VALUES ($1 , $2 , $3) RETURNING *;`;
    const values = [instructor_id, lead_id, comment];
    const result = await client.query(commentQuery, values);
    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    return next(createError(500, "Internal server error"));
  }
};

export const getLeadCommentsByLead = async (req, res, next) => {
  const { lead_id } = req.body;
  if (!lead_id) {
    return next(createError(400, "Invalid input"));
  }
  try {
    const checkres = await client.query(queries.getLeadById, [lead_id]);
    if (checkres.rows.length === 0) {
      return next(createError(400, "Lead does not exist"));
    }
  } catch (err) {
    next(createError());
  }

  try {
    const getCommentsQuery = `SELECT * FROM LeadComments WHERE lead_id = $1;`;
    const getComments = await client.query(getCommentsQuery, [lead_id]);
    res.status(200).json(getComments.rows);
  } catch (error) {
    next(createError());
  }
};

export const updateLeadComment = async (req, res, next) => {
  const { lead_id, comment_id, comment } = req.body;
  if (!lead_id || !comment_id || !comment) {
    return next(createError(400, "Invalid input"));
  }

  try {
    const checkQuery = `SELECT * FROM leads WHERE lead_id = $1;`;
    const checkres = await client.query(checkQuery, [lead_id]);
    if (checkres.rows.length === 0) {
      return next(createError(400, "Lead does not exist"));
    }
  } catch (err) {
    next(createError());
  }

  try {
    const checkQuery = `SELECT * FROM LeadComments WHERE comment_id = $1;`;
    const checkres = await client.query(checkQuery, [comment_id]);
    if (checkres.rows.length === 0) {
      return next(createError(400, "Comment does not exist"));
    }
  } catch (err) {
    next(createError());
  }

  try {
    const checkQuery = `UPDATE LeadComments SET comment = $1 WHERE comment_id = $2 RETURNING *;`;
    const values = [comment, comment_id];
    const result = await client.query(checkQuery, values);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    next(createError());
  }
};

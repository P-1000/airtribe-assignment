import express from "express";
import path from "path";
import { createError } from "../../config/error.js";

import { client } from "../../config/db.js";

export const getAllCourses = async (req, res, next) => {
  const query = `SELECT * FROM Courses;`;
  try {
    const result = await client.query(query);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Something went wrong"));
  }
};

export const getCoursesByName = async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(createError(400, "Name is required"));
  }
  const query = `SELECT * FROM Courses WHERE similarity(name , $1) > 0.3;`;
  try {
    const fet = await client.query(query, [name]);
    res.status(200).json({ data: fet.rows });
  } catch (error) {
    next(createError(500, "Something went wrong"));
  }
};

export const createCourse = async (req, res, next) => {
  const { name, course_description, max_seats, start_date, instructor_id } =
    req.body;

  if (!name || !course_description || !max_seats || !start_date || !instructor_id) {
    return next(createError(400, "All fields are required"));
  }


  const checkQuery = `SELECT * FROM Instructors WHERE instructor_id = $1;`;
  const checkValues = [instructor_id];
  try {
    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rowCount === 0) {
      return next(createError(404, "Instructor not found"));
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }

  const insertCourseQuery = `
    INSERT INTO Courses (name, course_description, max_seats, start_date, instructor_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const insertCourseValues = [
    name,
    course_description,
    max_seats,
    start_date,
    instructor_id,
  ];
  try {
    const insertCourseResult = await client.query(
      insertCourseQuery,
      insertCourseValues
    );
    const courseId = insertCourseResult.rows[0].course_id;

    const insertLeadCountsQuery = `
      INSERT INTO leadcounts (course_id, pending_count, accepted_count, rejected_count)
      VALUES ($1, 0, 0, 0);
    `;
    await client.query(insertLeadCountsQuery, [courseId]);

    res.status(201).json({ data: insertCourseResult.rows[0] });
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

export const updateCourse = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return next(createError(400, "Invalid course id"));
  }

  const checkQuery = `SELECT * FROM Courses WHERE course_id = $1;`;
  const checkValues = [id];

  try {
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rowCount === 0) {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }

  const { name, course_description, max_seats, start_date, instructor_id } =
    req.body;

  const updateQuery = `
        UPDATE Courses
        SET 
            name = COALESCE($1, name),
            course_description = COALESCE($2, course_description),
            max_seats = COALESCE($3, max_seats),
            start_date = COALESCE($4, start_date),
            instructor_id = COALESCE($5, instructor_id)
        WHERE course_id = $6
        RETURNING *;
    `;
  const updateValues = [
    name,
    course_description,
    max_seats,
    start_date,
    instructor_id,
    id,
  ];

  try {
    const updateResult = await client.query(updateQuery, updateValues);
    res.status(200).json({ data: updateResult.rows[0] });
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

export const deleteCourse = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return next(createError(400, "Invalid course id"));
  }

  const checkQuery = `SELECT * FROM Courses WHERE course_id = $1;`;
  const checkValues = [id];

  try {
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rowCount === 0) {
      return next(createError(404, "Course not found"));
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }

  const deleteQuery = `DELETE FROM Courses WHERE course_id = $1;`;
  const deleteValues = [id];

  try {
    await client.query(deleteQuery, deleteValues);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};

export const getCourseDetails = async (req, res, next) => {
  const { course_id } = req.body;

  if (!course_id)  return next(createError(400, "Course ID is required"));

  const query = `
  SELECT 
  Courses.* , 
  Instructors.name AS instructor_name 
  FROM 
  Courses INNER JOIN Instructors 
  ON Courses.instructor_id = Instructors.instructor_id 
  where Courses.course_id = $1;
  `;
  const values = [course_id];
  try {
    const result = await client.query(query, values);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

export const getFullCourseDetails = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return next(createError(400, "Course ID is required"));
    }

    const courseQuery = `
      SELECT * FROM Courses WHERE course_id = $1;
    `;
    const courseResult = await client.query(courseQuery, [course_id]);

    if (courseResult.rows.length === 0) {
      return next(createError(404, "Course not found"));
    }

    const query = `
      SELECT 
        Courses.* , 
        Instructors.name AS instructor_name ,
        (SELECT COUNT(*) FROM Leads WHERE course_id = $1) AS total_leads,
        (SELECT pending_count FROM LeadCounts WHERE course_id = $1) AS pending_leads,
        (SELECT accepted_count FROM LeadCounts WHERE course_id = $1) AS accepted_leads,
        (SELECT rejected_count FROM LeadCounts WHERE course_id = $1) AS rejected_leads
      FROM 
        Courses 
        INNER JOIN Instructors ON Courses.instructor_id = Instructors.instructor_id 
      WHERE 
        Courses.course_id = $1;
    `;
    const values = [course_id];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return next(createError(404, "Course details not found"));
    }

    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

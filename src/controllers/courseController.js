import express from "express";
import {queries} from "../../queries/queries.js";
import { createError } from "../../config/error.js";
import {body , validationResult} from "express-validator";
import { client } from "../../config/db.js";


// Get all courses
export const getAllCourses = async (req, res, next) => {
  try {
    const result = await client.query(queries.getAllCourses);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Something went wrong"));
  }
};

// get course by name 
export const getCoursesByName = async (req, res, next) => {
  const { name } = req.params;
  if(name === undefined || name === "") return next(createError(400, "Invalid input"));
  try {
    const result = await client.query(queries.getCourseByName, [name]);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};

// Get all courses by instructor id
export const createCourse = async (req, res, next) => {
  const { name, course_description, max_seats, start_date, instructor_id } = req.body;

  try {
    await client.query('BEGIN'); // Transaction starts

    const checkResult = await client.query(queries.getInstructorById, [instructor_id]);
    if (checkResult.rowCount === 0) {
      await client.query('ROLLBACK'); 
      return next(createError(404, "Instructor not found"));
    }
    const insertCourseResult = await client.query(queries.createCourse, [name, course_description, max_seats, start_date, instructor_id]);
    const courseId = insertCourseResult.rows[0].course_id;
    await client.query(queries.putLeadCount, [courseId, 0, 0, 0]);

    await client.query('COMMIT');  // Transaction ends
    res.status(201).json({ data: insertCourseResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK'); 
    return next(createError(500, "Internal server error"));
  } finally {
  }
};

// Update course Details 
export const updateCourse = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return next(createError(400, "Invalid course id"));
  }

  try {
    const checkResult = await client.query(queries.getCourseById, [id]);

    if (checkResult.rowCount === 0) {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }

  const { name, course_description, max_seats, start_date, instructor_id } =
    req.body;

  const updateValues = [
    name,
    course_description,
    max_seats,
    start_date,
    instructor_id,
    id,
  ];

  try {
    const updateResult = await client.query(queries.updateCourse, updateValues);
    res.status(200).json({ data: updateResult.rows[0] });
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
};


// get course details 
export const getCourseDetails = async (req, res, next) => {
  const { course_id } = req.params;
  if (!course_id)  return next(createError(400, "Course ID is required"));
  const values = [course_id];
  try {
    const result = await client.query(queries.getCourseDetails, values);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};


//Get full course details : including instructor details, course details, and course lead stats
export const getFullCourseDetails = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return next(createError(400, "Course ID is required"));
    }

    const courseResult = await client.query(queries.getCourseById, [course_id]);

    if (courseResult.rows.length === 0) {
      return next(createError(404, "Course not found"));
    }
    const values = [course_id];
    const result = await client.query(queries.getFullCourseDetails, values);

    if (result.rows.length === 0) {
      return next(createError(404, "Course details not found"));
    }

    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

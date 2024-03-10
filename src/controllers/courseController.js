import express from "express";
import {queries} from "../../queries/queries.js";
import { createError } from "../../config/error.js";
import {validationResult} from "express-validator";
import { client } from "../../config/db.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const result = await client.query(queries.getAllCourses);
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
  try {
    const fet = await client.query(queries.getCourseByName, [name]);
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
  const checkValues = [instructor_id];
  try {
    const checkResult = await client.query(queries.getInstructorById, checkValues);
    if (checkResult.rowCount === 0) {
      return next(createError(404, "Instructor not found"));
    }
  } catch (error) {
    return next(createError(500, "Internal server error"));
  }
  const insertCourseValues = [
    name,
    course_description,
    max_seats,
    start_date,
    instructor_id,
  ];
  try {
    const insertCourseResult = await client.query(
      queries.createCourse,
      insertCourseValues
    );
    const courseId = insertCourseResult.rows[0].course_id;
    await client.query(queries.putLeadCount, [courseId, 0, 0, 0]);

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

export const deleteCourse = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return next(createError(400, "Invalid course id"));
  }

  const checkValues = [id];

  try {
    const checkResult = await client.query(queries.getCourseById, checkValues);

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
  const values = [course_id];
  try {
    const result = await client.query(queries.getCourseDetails, values);
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

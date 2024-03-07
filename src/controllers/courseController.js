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
    res.send(next(createError(500, "Internal server error")));
  }
};

export const getCoursesByName = async (req, res, next) => {
  const { name } = req.params;
  const query = `SELECT * FROM Courses WHERE similarity(name , $1) > 0.3;`;
  try {
    const fet = await client.query(query, [name]);
    res.status(200).json({ data: fet.rows });
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

export const createCourse = async (req, res, next) => {
  const { name, course_description, max_seats, start_date, instructor_id } =
    req.body;
  const query = `INSERT INTO Courses (name , course_description , max_seats, start_date, instructor_id  ) VALUES ($1 , $2 , $3 , $4, $5) RETURNING * ;`;
  const values = [
    name,
    course_description,
    max_seats,
    start_date,
    instructor_id,
  ];
  try {
    const fet = await client.query(query, values);
    console.log(fet);
    res.status(201).json({ data: fet.rows[0] });
  } catch (error) {
    next(creatError(500, "Internal server error"));
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
      return next(createError(404, "Course not found"));
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

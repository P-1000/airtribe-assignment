import express from "express";
import { createError } from "../../config/error.js";
import { client } from "../../config/db.js";
import {queries} from "../../queries/queries.js";

const instructorRouter = express.Router();

// create new instructor
export const newInstructor = async (req, res, next) => {
  const { name, email, bio } = req.body;
  if (name === undefined || email === undefined || bio === undefined) {
    return next(createError(400, "Invalid input"));
  }

  if (name === "" || email === "" || bio === "") {
    return next(createError(400, "Invalid input"));
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return next(createError(400, "Invalid email"));
  }
  const query = `SELECT 1 FROM Instructors WHERE email = $1 LIMIT 1`;
  const values = [email];
  const result = await client.query(query, values);

  if (result.rows.length > 0) {
    return next(createError(409, "Instructor already exists"));
  }

  try {
    const values = [name, email, bio];
    const result = await client.query(queries.putInstuctor, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(createError());
  }
};

// update instructor
export const updateInstructor = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  if(id == undefined || id == "") return next(createError(400, "Invalid input"));

  const query = `SELECT 1 FROM Instructors WHERE instructor_id = $1 LIMIT 1`;
  const values = [id];

  try {
    const result = await client.query(query, values);
    if(result.rows.length === 0) {
      res.status(404).json({message: "Instructor not found"});
    }

    const updateValues = [name, email, bio, id];
    const res8 = await client.query(queries.updateInstructor, updateValues);
    res.status(200).json(res8.rows[0]);
  } catch (error) {
    next(createError());
  }
};


// get all instructors
export const getAllInstructors = async (req, res, next) => {
    try {
        const result = await client.query(queries.getAllInstructors);
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(createError());
    }
}

// get instructor by id 
export const getInstructorById = async (req, res, next) => {
    try {
        const {id} = req.params;
        if(id == undefined || id == "") return next(createError(400, "Invalid input"));

        const values = [id];
        const result = await client.query(queries.getInstructorById, values);
        if(result.rows.length === 0) {
            return next(createError(404, "Instructor not found"));
        }
        res.status(200).json(result.rows[0]);
        } catch (error) {
        next(createError());
    }
}

// delete instructor
export const deleteInstructor = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(createError(400, "Invalid input"));

  try {
      const checkResult = await client.query(queries.getInstructorById, [id]);

      if (checkResult.rows.length === 0) {
          return next(createError(404, "Instructor not found"));
      }
      const deleteQuery = `DELETE FROM Instructors WHERE instructor_id = $1;`;
      await client.query(deleteQuery, [id]);

      res.status(204).json({ message: "Instructor deleted successfully" });
  } catch (error) {
      return next(createError(500, "Internal server error"));
  }
}



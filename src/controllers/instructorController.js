import express from "express";
import { createError } from "../../config/error.js";
import { client } from "../../config/db.js";

const instructorRouter = express.Router();

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
    return next(createError(400, "Email already exists"));
  }

  try {
    const query = `INSERT INTO Instructors (name, email, bio) VALUES ($1, $2, $3) RETURNING *;`;
    const values = [name, email, bio];
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(createError());
  }
};

export const updateInstructor = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  if(id == undefined && id == "") return next(createError(400, "Invalid input"));

  const query = `SELECT 1 FROM Instructors WHERE instructor_id = $1 LIMIT 1`;
  const values = [id];

  try {
    const result = await client.query(query, values);
    if(result.rows.length === 0) {
      return next(createError(404, "Instructor not found"));
    }
    const updateQuery = `
      UPDATE Instructors
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        bio = COALESCE($3, bio)
      WHERE instructor_id = $4
      RETURNING *;
      `;

    const updateValues = [name, email, bio, id];
    const res8 = await client.query(updateQuery, updateValues);
    res.status(200).json(res8.rows[0]);
  } catch (error) {
    next(createError());
  }
};


export const getAllInstructors = async (req, res, next) => {
    try {
        const query = `SELECT * FROM Instructors;`;
        const result = await client.query(query);
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(createError());
    }
}


export const getInstructorById = async (req, res, next) => {
    try {
        const {id} = req.params;
        if(id == undefined && id == "") return next(createError(400, "Invalid input"));
        const query = `SELECT * FROM Instructors WHERE instructor_id = $1;`;
        const values = [id];
        const result = await client.query(query, values);
        if(result.rows.length === 0) {
            return next(createError(404, "Instructor not found"));
        }
        res.status(200).json(result.rows[0]);
        } catch (error) {
        next(createError());
    }
}

export const deleteInstructor = async (req, res, next) => {
    const {id} = req.params;
    if(id == undefined && id == "") return next(createError(400, "Invalid input"));
    try {
        const query = `SELECT 1 FROM Instructors WHERE instructor_id = $1;`;
        const values = [id];
        const result = await client.query(query, values);
        if(result.rows.length === 0) {
            return next(createError(404, "Instructor not found"));
        }
        const deleteQuery = `DELETE FROM Instructors WHERE instructor_id = $1;`;
        const deleteValues = [id];
        await client.query(deleteQuery, deleteValues);
        res.status(204).json({message: "Instructor deleted successfully"});
    } catch (error) {
        next(createError());
    }
}

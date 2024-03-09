import { client } from "../config/db.js";

const createCourseTable = `CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    max_seats INT NOT NULL,
    course_description TEXT NOT NULL,
    start_date DATE NOT NULL,
    instructor_id INT NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES instructors (instructor_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

const createLeadTable = `CREATE TABLE IF NOT EXISTS leads (
    lead_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    phone VARCHAR(100) NOT NULL,
    linkedin_profile VARCHAR(100) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

const createLeadCommentTable = `CREATE TABLE IF NOT EXISTS leadcomments (
    comment_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL,
    instructor_id INT NOT NULL,
    comment TEXT,
    FOREIGN KEY (instructor_id) REFERENCES instructors (instructor_id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads (lead_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

const createLeadCountTable = `CREATE TABLE IF NOT EXISTS leadcounts (
    id SERIAL PRIMARY KEY,
    course_id INT,
    pending_count INT DEFAULT 0,
    accepted_count INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
  )`;

const pg_ext = `CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

  

export const createTbl = async (req, res) => {
  const createInstructorTable = `CREATE TABLE IF NOT EXISTS instructors (
      instructor_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      bio TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  try {
    await client.query(createInstructorTable);
    await client.query(createCourseTable);
    await client.query(createLeadTable);
    await client.query(createLeadCommentTable);
    await client.query(createLeadCountTable);
    await client.query(pg_ext);
    res.status(200).json({ message: "Tables created successfully" });
  } catch (error) {
    console.error("Error creating tables:", error);
    res.status(500).json({ message: "Error creating tables" });
  }
};

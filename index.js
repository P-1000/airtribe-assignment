import express from "express";
import dotenv from "dotenv";
import instructorRouter from "./src/routes/instructorRoutes.js";
import courseRouter from "./src/routes/courseRoutes.js";
import leadRouter from "./src/routes/leadRoutes.js";
import { client } from "./config/db.js";
import { createError } from "./config/error.js";


dotenv.config();

const app = new express();
app.use(express.json());





//routes :
app.use("/instructors", instructorRouter);
app.use("/courses", courseRouter);
app.use("/leads", leadRouter);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Airtribe running on port : " + process.env.PORT });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.get("/createTables", async (req, res) => {
  const createInstructorTable = `CREATE TABLE IF NOT EXISTS instructors (
    instructor_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
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
    status VARCHAR(10) CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
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

  try {
    await client.query(createInstructorTable);
    await client.query(createCourseTable);
    await client.query(createLeadTable);
    await client.query(createLeadCommentTable);
    await client.query(createLeadCountTable);
    res.status(200).json({ message: "Tables created successfully" });
  } catch (error) {
    console.error("Error creating tables:", error);
    res.status(500).json({ message: "Error creating tables" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  client
    .connect()
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log("Error connecting to database");
      createError(err, 500, "error", "Error connecting to database");
    });
});

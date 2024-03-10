import { client } from "../config/db.js";
import { createError } from "../config/error.js";
import faker from "faker";

export const instructor_data = async () => {
  try {
    for (let i = 0; i < 10; i++) {
      const name = faker.name.findName();
      const email = faker.internet.email();
      const bio = faker.lorem.paragraph();
      const insertInstructorQuery = `
                INSERT INTO instructors (name, email, bio)
                VALUES ($1, $2, $3)
            `;
      const instructorValues = [name, email, bio];
      await client.query(insertInstructorQuery, instructorValues);
    }
  } catch (error) {
    createError(error, "instructor_data");
  }
};

export const course_data = async () => {
    try {
      const getInstructorIdsQuery = `SELECT instructor_id FROM instructors`;
      const instructorIdsResult = await client.query(getInstructorIdsQuery);
      const instructorIds = instructorIdsResult.rows.map(
        (row) => row.instructor_id
      );
  
      for (const instructorId of instructorIds) {
        const courseName = faker.random.word();
        const maxSeats = Math.floor(Math.random() * 100) + 1;
        const courseDescription = faker.lorem.paragraph();
        const startDate = faker.date.future();
        const insertCourseQuery = `
          INSERT INTO courses (name, max_seats, course_description, start_date, instructor_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING course_id
        `;
        const courseValues = [
          courseName,
          maxSeats,
          courseDescription,
          startDate,
          instructorId,
        ];
        const courseResult = await client.query(insertCourseQuery, courseValues);
        const courseId = courseResult.rows[0].course_id;
  
        const insertLeadCountQuery = `
          INSERT INTO leadcounts (course_id, pending_count, rejected_count, accepted_count)
          VALUES ($1, 0, 0, 0)
        `;
        const leadCountValues = [courseId];
        await client.query(insertLeadCountQuery, leadCountValues);
  
      }
    } catch (error) {
      createError(error, "course_data");
    }
  };
  

export const lead_data = async () => {
  try {
    const getCourseIdsQuery = `SELECT course_id FROM courses`;
    const courseIdsResult = await client.query(getCourseIdsQuery);
    const courseIds = courseIdsResult.rows.map((row) => row.course_id);
    for (const courseId of courseIds) {
      const name = faker.name.findName();
      const email = faker.internet.email();
      const phone = faker.phone.phoneNumber();
      const linkedinProfile = faker.internet.url();
      const insertLeadQuery = `
                INSERT INTO leads (name, email, course_id, phone, linkedin_profile)
                VALUES ($1, $2, $3, $4, $5)
            `;
      const leadValues = [name, email, courseId, phone, linkedinProfile];
      await client.query(insertLeadQuery, leadValues);
    }
  } catch (error) {
    createError(error, "lead_data");
  }
};

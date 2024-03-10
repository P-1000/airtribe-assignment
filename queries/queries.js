export const queries = {
  getAllCourses: `SELECT * FROM Courses;`,

  getCourseById: `
      SELECT * FROM courses WHERE course_id = $1;
    `,
  getCourseByName: `
      SELECT * FROM Courses WHERE similarity(name , $1) > 0.3;
    `,
  getCourseDetails: `
    SELECT 
    Courses.* , 
    Instructors.name AS instructor_name 
    FROM 
    Courses INNER JOIN Instructors 
    ON Courses.instructor_id = Instructors.instructor_id 
    where Courses.course_id = $1;
    `,
  getFullCourseDetails: `
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
    `,
  createCourse: `
    INSERT INTO Courses (name, course_description, max_seats, start_date, instructor_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
  putLeadCount: `
      INSERT INTO leadcounts (course_id, pending_count, accepted_count, rejected_count)
      VALUES ($1, $2, $3, $4);
    `,
  updateCourse: `
          UPDATE Courses
          SET 
              name = COALESCE($1, name),
              course_description = COALESCE($2, course_description),
              max_seats = COALESCE($3, max_seats),
              start_date = COALESCE($4, start_date),
              instructor_id = COALESCE($5, instructor_id)
          WHERE course_id = $6
          RETURNING *;
      `,

  getInstructorById: `
      SELECT * FROM Instructors WHERE instructor_id = $1;
    `,

  putInstuctor: `INSERT INTO Instructors (name, email, bio) VALUES ($1, $2, $3) RETURNING *;`,

  updateInstructor: `
    UPDATE Instructors
    SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      bio = COALESCE($3, bio)
    WHERE instructor_id = $4
    RETURNING *;
    `,
  getAllInstructors: `SELECT * FROM Instructors;`,

  putLead: `
  INSERT INTO leads (course_id, name, email, phone, linkedin_profile)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`,
  updateLeadCount: `
  UPDATE leadcounts
  SET pending_count = pending_count + 1
  WHERE course_id = $1
  RETURNING pending_count;
`,

getLeadById: `
  SELECT * FROM leads WHERE lead_id = $1;
`,


};

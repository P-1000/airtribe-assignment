CREATE DATABASE AirTribe;


CREATE TABLE Instructors (
    instructor_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT
);

CREATE TABLE Courses (
    course_id SERIAL PRIMARY KEY ,
    instructor_id INT,
    name VARCHAR(255) NOT NULL,
    max_seats INT NOT NULL,
    course_description TEXT,
    start_date DATE NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id)
);
CREATE TABLE Leads (
    lead_id SERIAL PRIMARY KEY,
    course_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    linkedin_profile VARCHAR(255),
    status VARCHAR(10) CHECK (status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE LeadComments (
    comment_id SERIAL PRIMARY KEY ,
    lead_id INT,
    instructor_id INT,
    comment TEXT,
    FOREIGN KEY (lead_id) REFERENCES Leads(lead_id),
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id)
);


CREATE TABLE LeadCounts (
    id SERIAL PRIMARY KEY,
    course_id INT,
    pending_count INT DEFAULT 0,
    accepted_count INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

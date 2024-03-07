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
    start_date DATE NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id)
);

CREATE TABLE Leads (
    lead_id SERIAL PRIMARY KEY ,
    course_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    linkedin_profile VARCHAR(255),
    status ENUM('Pending', 'Accepted', 'Rejected', 'Waitlisted') DEFAULT 'Pending',
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE LeadComments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT,
    instructor_id INT,
    comment TEXT,
    FOREIGN KEY (lead_id) REFERENCES Leads(lead_id),
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id)
);

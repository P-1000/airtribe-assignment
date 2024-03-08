import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;


export const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DBPASS,
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  database: process.env.DBNAME,
});


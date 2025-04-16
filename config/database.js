const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Connect to MySQL
db.connect((error) => {
    if (error) {
        console.error("Database connection failed:", error);
    } else {
        console.log("✅ MySQL Connected...");
    }
});

module.exports = db;

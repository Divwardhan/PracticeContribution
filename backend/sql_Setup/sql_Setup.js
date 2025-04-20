import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function sql_Setup() {
    if (!process.env.SQL_HOST || !process.env.SQL_USERNAME || !process.env.SQL_PASSWORD || !process.env.SQL_DATABASE) {
        console.error("Error: Missing required environment variables.");
        process.exit(1);
    }

    const database = mysql.createPool({
        connectionLimit: 100,
        host: process.env.SQL_HOST,
        user: process.env.SQL_USERNAME,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        port: process.env.SQL_PORT || 3306
    });

    database.getConnection((err, connection) => {
        if (err) {
            console.error("Database Connection Failed:", err.message);
            process.exit(1); // ✅ added exit on failure
        }
        console.log("DB connected successfully: " + connection.threadId);
        connection.release();
    });

    return database.promise(); // ✅ fixed: always return promise after test
}

export default sql_Setup;

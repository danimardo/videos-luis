const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

async function initDatabase() {
    let conn;
    try {
        // First, ensure the database exists
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await conn.end();

        // Now create the table
        conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS video_markers (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255),
                url VARCHAR(1024) NOT NULL,
                seconds INT NOT NULL,
                note TEXT,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database and table initialized successfully');
    } catch (error) {
        console.error('Detailed database initialization error:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
        throw error; // Re-throw to ensure the error is not silently ignored
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    pool,
    initDatabase
};

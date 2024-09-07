import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
    waitForConnections: true,
    connectionLimit: 10, // Number of connections in the pool
    queueLimit: 0,
})

export default pool
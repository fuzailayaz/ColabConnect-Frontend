// import 'dotenv/config'; // Load environment variables
// import pool from '@/utils/db'; // Adjust path if needed

// async function initDatabase() {
//   const client = await pool.connect();

//   try {
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         username VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         first_name VARCHAR(255),
//         last_name VARCHAR(255),
//         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     console.log('✅ Database tables created successfully');
//   } catch (error) {
//     console.error('❌ Database initialization failed:', error);
//     throw error;
//   } finally {
//     client.release();
//   }
// }

// initDatabase()
//   .then(() => process.exit(0))
//   .catch(() => process.exit(1));

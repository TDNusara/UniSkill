const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniskill_db';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${process.env.MONGO_URI || '127.0.0.1:27017'}: ${error.message}`);
    console.log('[Database Info] Please ensure MongoDB is running locally (mongod) or update MONGO_URI in backend/.env with your MongoDB Atlas connection string.');
  }
};

module.exports = connectDB;

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { connectMongoDB, initDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const accountsRoutes = require('./routes/accounts');
const encryptionRoutes = require('./routes/encryption');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/accounts', accountsRoutes);
app.use('/encryption', encryptionRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDatabase();
    await connectMongoDB();
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`PostgreSQL: Connected`);
      console.log(`MongoDB: Connected`);
      console.log(`Redis: Connected`);
    });
  } catch (error) {
    console.error('failed to start server:', error);
    process.exit(1);
  }
};

startServer();

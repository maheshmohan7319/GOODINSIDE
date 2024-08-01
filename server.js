
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require("cors");


const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');

const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(cors())

app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

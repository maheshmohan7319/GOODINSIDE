
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require("cors");


const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');

const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(cors())

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Add this line
const { getSummary } = require('./utils/summaryUtil');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(error => console.log('MongoDB connection error:', error));

const app = express();

// Middleware
app.use(express.json());

// Transaction Routes
app.use('/api', transactionRoutes);

// Category Routes
app.use('/api', categoryRoutes); // Use the category routes

// Summary Route
app.get('/api/summary', getSummary);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

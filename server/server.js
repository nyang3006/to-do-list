const express = require('express'); // Import Express framework
const cors = require('cors'); // Import CORS middleware for handling cross-origin requests
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const app = express(); // Initialize Express app
const tasksRouter = require('./routes/tasks_router.js'); // Import routes for task-related API

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS for frontend running at localhost:5173 (likely Vite/React dev server)
app.use(cors({
    origin: 'http://localhost:5173'
}));

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017/to_do_list';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUri, {
    useNewUrlParser: true, // Use new URL parser
    useUnifiedTopology: true, // Use new Server Discovery and Monitoring engine
});

// Handle MongoDB connection events
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error')); // Log connection errors
db.once('open', () => console.log('Connected to MongoDB')); // Confirm successful connection

// Mount the task router on /routes
app.use('/routes', tasksRouter);

// Start the server on port 3000
const server = app.listen(3000, () => {
    console.log('Server up and running');
});

// Graceful shutdown logic on Ctrl+C (SIGINT)
process.on('SIGINT', async () => {
    try {
        await db.close(); // Close MongoDB connection
        console.log('Server closed. Database instance disconnected');
        process.exit(0); // Exit successfully
    } catch (error) {
        console.error('Error closing database: ', error);
        process.exit(1); // Exit with error code
    }
});

module.exports = server; // Export the server (useful for testing or external control)
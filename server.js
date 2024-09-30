// server.js
import express from 'express'; // Import Express
import routes from './routes/index.js'; // Import routes
import 'dotenv/config'; // Load environment variables

const app = express(); // Create an Express application

// Middleware to parse JSON bodies
app.use(express.json());

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Load all routes
app.use(routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

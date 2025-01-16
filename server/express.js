const express = require('express');

// Import the assignDistance function (your event listener).
const assignDistance = require('./assignDistance');

// Initialize the Express app
const app = express();

// Use built-in middleware to handle JSON requests.
app.use(express.json());

// Start listening to the event (assuming it's not tied to any particular request).
try {
  assignDistance();
  console.log('Event listener running successfully.');
} catch (error) {
  console.error('Error running the event listener:', error);
}

// Define a default route for basic server check.
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server on the specified port.
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}\n`);
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Add Socket.io CORS configuration
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Middleware to allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

let currentQuestion = null;
let pollResults = [];
const PORT = process.env.PORT || 4000;

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('newQuestion', (questionData) => {
    console.log('New question received:', questionData);
    currentQuestion = questionData;

    // Initialize poll results for the new question
    pollResults = new Array(questionData.options.length).fill(0);

    // Emit the "newQuestion" event to all clients with the new question data
    io.emit('newQuestion', questionData);
    console.log('New question emitted to clients:', questionData);
  });

  socket.on('submitAnswer', (selectedOption) => {
    console.log("Name is ",selectedOption);
    console.log("option index choosen by the student name ",selectedOption.studentName, " and the choosen option index is ",selectedOption.option);

    // Increment the response count for the selected option
    pollResults[selectedOption.option]++;

    // Emit updated poll results to all clients
    io.emit('pollResults',{ pollResults: pollResults, allValues: selectedOption});
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



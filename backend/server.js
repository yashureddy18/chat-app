const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST", "DELETE", "PUT"]
    }
});

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// REST endpoints are good for initial fetch. We will use sockets for real-time.
app.get('/messages', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    db.getMessages(userId, (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(messages);
    });
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', (data) => {
        const { text, senderId, senderName } = data;
        db.addMessage(text, senderId, senderName, (err, message) => {
            if (err) return console.error(err);
            // Broadcast to everyone
            io.emit('messageAdded', message);
        });
    });

    socket.on('pinMessage', (data) => {
        const { id, isPinned } = data;
        db.pinMessage(id, isPinned, (err, changes) => {
            if (err) return console.error(err);
            // Broadcast update
            io.emit('messagePinned', { id, isPinned });
        });
    });

    socket.on('deleteMessage', (data) => {
        const { id, userId, type } = data;
        db.deleteMessage(id, userId, type, (err, changes) => {
            if (err) return console.error(err);
            if (type === 'everyone') {
                io.emit('messageDeletedEveryone', { id });
            } else {
                // Delete for me doesn't need to be broadcast to everyone
                // The client who deleted it will just remove it locally
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

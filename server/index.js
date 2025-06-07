const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');

require('dotenv').config();

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

app.get('/', (req, res) => {
    res.send('Unichat AI Server is running');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('send_message', async (data) =>{
        try{
            const newMessage = new Message({
                content: data.content,
                author: data.author,
            });

            const savedMessage = await newMessage.save();
            io.emit('receive_message', savedMessage);
        }
        catch(error){
            console.error('Error Saving Message:', error);
        }
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

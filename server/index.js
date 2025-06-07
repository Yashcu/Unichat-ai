const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messageRoutes');
const { getAIResponse } = require('./utils/aiService'); // Assuming you have a utility to get AI responses

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

app.use('/api/messages', messageRoutes);

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

            if(data.content.startsWith('/ai')){
                const question = data.content.substring(4);
                const aiResponseContent = await getAIResponse(question);

                const aiMessage = new Message({
                    content: aiResponseContent,
                    author: 'Unichat AI',
                    isAI: true,
                });
                const savedAIMessage = await aiMessage.save();
                io.emit('receive_message', savedAIMessage);
            }
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

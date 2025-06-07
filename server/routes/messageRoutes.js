const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
    try{
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json(messages);
    }
    catch(error){
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;


const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    author:{
        type: String,
        required: true,
    },
    isAI:{
        type: Boolean,
        default: false,
    },
    timestamp:{
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    dialogs : [new mongoose.Schema({
        senderID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }, { timestamps: { createdAt: true, updatedAt: false }})],
    owners:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }],
        required: true,
        validate(val) {
            // make sure that owners of this conversation are more than 2 people
            if (val.length < 2) {
                throw new Error("Owners array can not be empty or less than 1");
            }
        }
    } 
}, {
    timestamps: true
})

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;
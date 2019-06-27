const mongoose = require('mongoose');
const User = require('./user');

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

conversationSchema.methods.toJSON = function() {
    const conversation = this;

    // convert conversation to object so we can use delete operator
    const conObj = conversation.toObject();

    // delete some fields that are not useful
    delete conObj.createdAt;
    return conObj;
}

conversationSchema.pre('save', async function(next) {
    const conversation = this;

    // if this conversation is new, then push a new conversation info to user
    if(conversation.isNew) {
        const [ senderID, receiverID ] = conversation.owners;
        // push new conversation data info to receiver and sender
        const receiver = await User.findById(receiverID);
        const sender = await User.findById(senderID);

        receiver.conversations.push({
            conversation: conversation._id,
            isRead: false,
            receiver: senderID
        })

        sender.conversations.push({
            conversation: conversation._id,
            isRead: true,
            receiver: receiverID
        })

        await receiver.save();
        await sender.save();
    }
    next();
}) 

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
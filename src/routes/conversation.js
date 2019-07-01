const express = require('express');
const router = new express.Router();
const Conversation = require('../models/conversation');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const mongoose = require('mongoose');

// check if this user is a valid user
const isValidUser = async (userID) => {
    const user = await User.findById(userID);

    if (!user) {
        return false;
    }
    return true;
}

// get all conversations of this user.
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversation = await Conversation.find({ owners: req.user._id});

        if (!conversation) {
            return res.status(404).send();
        }

        res.send(conversation);
    } catch(e) {
        console.log(e);
        res.status(400).send()
    }
})

/*
create a new conversations between 2 persons.
incoming request body should be in this format
{
    content: 'something to say'
}
*/
router.post('/new/conversations/:receiverID', auth, async (req, res) => {
    try {
        const senderID = new mongoose.Types.ObjectId(req.user._id.toString());
        // check valid receiver
        const receiverID = new mongoose.Types.ObjectId(req.params.receiverID);

        const isValid = await isValidUser(receiverID);
        if (!isValid) {
            return res.status(400).send({ error : "Invalid receiver" });
        }

        // create new conversation
        const conversation = new Conversation({
            dialogs: [{
                senderID: senderID,
                content: req.body.content
            }],
            owners: [ senderID, receiverID ]
        })
        await conversation.save();
        
        res.status(201).send(conversation);
    } catch(e) {
        console.log(e);
        res.status(400).send(e);
    }
})

// add new dialog to an existing conversation
router.patch('/send-message/conversations/:conversationID', auth, async (req, res) => {
    /* request body should be like this
    {
        "content": "something"
    }
    */
    try {
        // add senderID to request body
        const senderID = new mongoose.Types.ObjectId(req.user._id);
        req.body.senderID = senderID;

        // get conversation
        const conversationID = req.params.conversationID;
        const conversation = await Conversation.findById(conversationID);
       
        // check if the sender is the owner of the conversation
        const result = conversation.owners.find(owner => owner.toString() === senderID.toString());
        if (!result) {
            return res.status(400).send({ error: "user is not in this conversation" });
        }

        // add a new dialog to this conversations
        conversation.dialogs.push(req.body);
        await conversation.save();

        res.send(conversation);
    } catch(e) {
        console.log(e);
        res.status(400).send();
    }
})

module.exports = router;


// for testing purpose
// const myFunc = async() => {
//     const conversation = await Conversation.find({ owners: "5d13eeb6aaad192128ff6548"});
//     console.log('conversation', conversation);
// }

// myFunc();

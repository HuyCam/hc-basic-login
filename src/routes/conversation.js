const express = require('express');
const router = new express.Router();
const Conversation = require('../models/conversation');
const User = require('../models/user');

// check if this user is a valid user
const isValidUser = async (userID) => {
    const user = await User.findById(userID);

    if (!user) {
        return false;
    }

    return true;
}

/*Check if this conversation is valid
 conversation is only valid if
 1. senderID is one of the owners
 2. senderID is a valid user
 3. receiverID is a valid user
*/
const checkValidConversation = async (senderID, owners) => {
    // check if sender is one of the owners
    const user = owners.find(owner => owner.toString() === senderID.toString());

    if (!user) {
        throw new Error({error: "Sender is not in this conversation"});
    }
    
    // check if receiver and sender is valid user
    const receiverID = owners.find(owner => owner.toString() !== senderID.toString());
    if (!isValidUser(receiverID)) {
        throw new Error({ error: "Invalid receiver" })
    }

    if (!isValidUser(senderID)) {
        throw new Error({ error: "Invalid sender" })
    }

    // if everything is passed return this format object to process
    return {
        receiverID,
        senderID
    }
}

// create a new conversations between 2 persons.
router.post('/new/conversations', async (req, res) => {
    try {
        const conversation = new Conversation(req.body);

        // check if this conversation is valid
        const { receiverID, senderID } = await checkValidConversation(conversation.dialogs[0].senderID, conversation.owners);
        const user = await User.findById(senderID);

        // add this conversation to existing user
        user.conversations.push({
            conversation: conversation._id,
            isRead: true,
            receiver: receiverID
        })

        await conversation.save();
        await user.save();

        res.send(conversation);
    } catch(e) {
        console.log(e);
        res.status(400).send(e);
    }
})

// add new dialog to an existing conversation
router.patch('/add-dialog/conversations/:id', async (req, res) => {
    /* request body should be like this
    "content": {
        "senderID": id,
        "content": "something"
    }
    */
   const content = req.body.content;
   const conversationID = req.params.id;
    try {
        let conversation = await Conversation.findById(conversationID);

        conversation.dialogs.push(content);
        await conversation.save();

        res.send(conversation);
    } catch(e) {
        console.log(e);
        res.status(400).send();
    }
})

module.exports = router;
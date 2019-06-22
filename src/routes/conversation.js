const express = require('express');
const router = new express.Router();
const Conversation = require('../models/conversation');

// create a new conversations between 2 persons.
router.post('/new/conversations', async (req, res) => {
    try {
        const conversation = new Conversation(req.body);
        await conversation.save();

        res.send(conversation);
    } catch(e) {
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
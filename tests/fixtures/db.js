const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Conversation = require('../../src/models/conversation');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Trang',
    email: 'trang@example.com',
    password: '123@what',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}


const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'Cam Huy',
    email:'camghuy@example.com',
    password: '123456',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const userThreeId = new mongoose.Types.ObjectId();
const userThree = {
    _id: userThreeId,
    name: 'David',
    email:'david@example.com',
    password: '123456',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

// set up conversation between user two and three
const conversationOneId = new mongoose.Types.ObjectId();
const conversationOne = {  
    dialogs: [
        {
            senderID: userTwoId.toString(),
            content: 'Hello from user two'
        }
    ],
    owners: [ userTwoId.toString(), userThreeId.toString()]
}

const setupDatabase = async () => {
    // clear all data to test
    await User.deleteMany();
    await Conversation.deleteMany();

    //add a user for login test
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userThree).save();

    // add a conversation
    await new Conversation(conversationOne).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    userThree,
    userThreeId,
    conversationOne,
    conversationOneId,
    setupDatabase
}
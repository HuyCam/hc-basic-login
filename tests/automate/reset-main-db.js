/*
This automate clear all docs of a collection and add 2 new docs for manual testing purpose on the client side
*/

require('../../src/db/mongoose');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Conversation = require('../../src/models/conversation');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Trang',
    email: 'trang@gmail.com',
    password: '123456'
}


const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'Cam Huy',
    email:'cam@gmail.com',
    password: '123456',
}

const userThree = {
    name: 'David',
    email: 'david@gmail.com',
    password: '123456'
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Conversation.deleteMany();
    //add a user for login
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userThree).save();
}

setupDatabase().then(res => {
    console.log('Done removing all. Created new database data for clientside testing');
    process.exit(1)
});
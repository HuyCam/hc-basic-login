const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');

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

const setupDatabase = async () => {
    // clear all data to test
    await User.deleteMany();

    //add a user for login test
    await new User(userOne).save();
    await new User(userTwo).save();
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase
}
const express = require('express');
const router = new express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const jwt = require('jsonwebtoken');

const loginSimulation = [
    {
        email: 'cam@gmail.com',
        password: '123456'
    },
    {
        email: 'trang@gmail.com',
        password: '123456'
    },
    {
        email: 'david@gmail.com',
        password: '123456'
    }
]

module.exports = {
    loginSimulation
}
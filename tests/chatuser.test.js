const request = require('supertest');
const server = require('../src/server');
const User = require('../src/models/user');
const { setupDatabase, userOne, userOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
    const response = await request(server).post('/users').send({
        name: 'Huy Cam',
        email: 'camghuy@gmail.com',
        password: '123456'
    }).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.aUser._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        aUser: {
            name: 'Huy Cam',
            email: 'camghuy@gmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('123456');
})

test('Should NOT be able to register an existing user', async () => {
    await request(server).post('/users').send(userOne).expect(400);
})

test('Should NOT be able to register a incorrect format of user', async () => {
    await request(server).post('/users').send({
        email: 'david@gmail.com',
        password: '123456'
    }).expect(400);

    await request(server).post('/users').send({
        name: 'david',
        password: '123456'
    }).expect(400);

    await request(server).post('/users').send({
        name: 'david',
        email: 'david@gmail.com'
    }).expect(400);
})

test('Should login existing user', async () => {
    const { body } = await request(server).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    // Assert that token got send back match the token in the user data
    const user = await User.findById(userOneId);
    expect(body.token).toBe(user.tokens[user.tokens.length - 1].token);
})

test('Should not login nonexistent user', async () => {
    await request(server).post('/users/login').send({
        email: 'something@example.com',
        password: '123456'
    }).expect(400);
})

test('Should be able to log out current user', async () => {
    await request(server).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    await request(server)
    .post('/users/logout')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

    // asert that current tokens is deleted from user tokens
    const user = await User.findById(userOneId);

    const token = user.tokens.find(e => {
        e.token === userOne.tokens[0].token;
    })

    expect(token).toBe(undefined);
})
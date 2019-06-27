const request = require('supertest');
const server = require('../src/server');
const User = require('../src/models/user');
const { setupDatabase, userOne, userOneId, userTwo, userTwoId, userThree, userThreeId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
    const response = await request(server).post('/users').send({
        name: 'Huy Cam',
        email: 'camghuy@gmail.com',
        password: '123456'
    }).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        user: {
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

test('Should login existing user and include existing conversations', async () => {
    const { body } = await request(server).post('/users/login').send({
        email: userTwo.email,
        password: userTwo.password
    }).expect(200);

    // Assert that token got send back match the token in the user data
    const user = await User.findById(userTwoId);
    expect(body.token).toBe(user.tokens[user.tokens.length - 1].token);

    // Assert that user got send back in clude existing conversation
    expect(body.user.conversations[0]).toMatchObject({
        receiver: {
            _id: userThreeId.toString(),
            name: userThree.name,
            email: userThree.email
        }
    })
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

test('Should get a user', async () => {
    const { body } = await request(server)
                    .get(`/find/users/?email=${userTwo.email}`)
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send()
                    .expect(200);

    // Assert that the body is include info that we need
    expect(body).toMatchObject({
        name: userTwo.name,
        email: userTwo.email,
        _id: userTwoId.toString()
    })
})
const request = require('supertest');
const server = require('../src/server');
const Conversation = require('../src/models/conversation');
const mongoose = require('mongoose');
const { setupDatabase, userOne, userOneId, userTwo, userTwoId, userThree, userThreeId, conversationOne, conversationOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should init a new conversation', async() => {
    // create a conversation between user one and user two
    const { body } = await request(server)
                    .post(`/new/conversations/${userTwoId.toHexString()}`)
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        content: 'Hello'
                    })
                    .expect(201);

    // check if the response body already include content hello and two owner
    expect(body).toMatchObject({
        dialogs: [{
            content: 'Hello'
        }],
        owners: [userOneId.toString(), userTwoId.toString()]
    })   
    
    // check if this conversation should be in the database
    const conversation = await Conversation.findById(body._id);
    expect(conversation).not.toBeNull();
})

test('Should NOT be able to init a message if receiver is not valid', async() => {
    const sampleID = new mongoose.Types.ObjectId();
    const { body } = await request(server)
                    .post(`/new/conversations/${sampleID}`)
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        content: 'Hello'
                    })
                    .expect(400);

    expect(body).toMatchObject({
        error : "Invalid receiver"
    })
})

test('Should NOT be able to send message if user is not in the conversation', async () => {
    const { body } = await request(server)
                    .patch(`/send-message/conversations/${conversationOneId}`)
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        content: 'Hi, how are you?'
                    })
                    .expect(400);
    
    expect(body).toMatchObject({
        error: "user is not in this conversation"
    })
})

test('Should be able to send message', async () => {
    const { body } = await request(server)
                    .patch(`/send-message/conversations/${conversationOneId}`)
                    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
                    .send({
                        content: 'Hi, how are you?'
                    })
                    .expect(200);

    // Assert that a new dialog is added in the conversation
    expect(body.dialogs[1]).toMatchObject({
         content: 'Hi, how are you?'
    })
})


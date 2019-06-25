const request = require('supertest');
const server = require('../src/server');
const Conversation = require('../src/models/conversation');
const mongoose = require('mongoose');
const { setupDatabase, userOne, userOneId, userTwo, userTwoId, userThree, userThreeId, conversationOne, conversationOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

// test('Should init a new conversation and add new dialog to that conversation', async() => {
//     const { body } = await request(server).post('/new/conversations').send({
//         dialogs: [
//             {
//                 senderID: userOneId.toString(),
//                 content: 'Hello'
//             }
//         ],
//         owners: [userOneId.toString(), userTwoId.toString()]
//     }).expect(201);

//     // Assert that a conversation should be in database
//     const conversation = await Conversation.findById(body._id);
//     const { owners, dialogs} = conversation;

//     expect(conversation).not.toBeNull();

//     // Assert that response body should match this
//     expect(body).toMatchObject({
//         owners: [
//             owners[0].toString(), owners[1].toString()
//         ],
//         dialogs: [
//             {
//                 senderID: dialogs[0].senderID.toString(),
//                 content: dialogs[0].content,
//             }
//         ]
//     });

//     // send an update for current conversation
//     const { body2 } = await request(server)
//             .patch('/send-message/conversations/' + conversationID.toString())
//             .send({
//                 content: {
//                     senderID: userTwo,
//                     content: "Oh Hello there! How are you?"
//                 }
//             }).expect(200);

//     // Assert that a new content has been added to current conversation
//     const conversation2 = await Conversation.findById(body._id);
//     expect(conversation2.dialogs.length).toBe(2);
// })

// test('Should NOT be able to update conversation if user is not owner of the conversation', async() => {
//     await request(server)
//     .patch('/send-message/conversations/' + conversationOneId.toString())
//     .send({
//         content: {
//             senderID: userOne.toString(),
//             content: "Oh Hello there! How are you?"
//         }
//     }).expect(400);
// })


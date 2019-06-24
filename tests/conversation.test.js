const request = require('supertest');
const server = require('../src/server');
const Conversation = require('../src/models/conversation');
const { setupDatabase, userOne, userOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should init a new conversation', async() => {
    expect(32).toBe(32);
}) 
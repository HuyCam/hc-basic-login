const express = require('express');
const router = new express.Router();
const multer = require('multer');
const auth = require('../middlewares/auth');
// import models
const User = require('../models/user');
const Conversation = require('../models/conversation');

// set up image upload
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    filter (req, file, cb) {
        if (!file.originalname.match(/(jpg|jpeg|png)/i)) {
            return cb(new Error('Please upload a file image'))
        }

        cb(undefined, true);
    }
})
// get your profile
router.get('/users/me', auth, async (req ,res) => {
    const user = await req.user.toJSON()
    res.send({user: user });
});

// find a user by email. The query should be just include ?email=
router.get('/find/users', auth, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.query.email });

        if (!user) {
            return res.status(404).send({error: 'Not Found'});
        }

        res.send({ 
            name: user.name,
            email: user.email,
            _id: user._id
        })
    } catch(e) {
        res.status(500).send();
    }
})

// create user
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.generateToken();
        await user.save();

        // create a replicate of a newly created user without a password field
        const aUser = await user.toJSON();
        res.status(201).send({ user: aUser, token });
    } catch(e) {
        res.status(400).send(e);
    }
});

// login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken(user.id.toString());

        const aUser = await user.toJSON();
        res.send({ user: aUser, token });
    } catch(e) {
        res.status(400).send(e);
    }
})

// logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(doc => doc.token !== req.token);
        await req.user.save();
        res.send({ msg: 'Log out successfully. '});
    } catch(e) {
        res.status(500).send();
    }   
});

// logout all other devices
router.post('/users/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({ msg: 'Log out all successfully'});
    } catch(e) {
        res.status(400).send();
    }
});

// fetch a conversation and receiver
router.get('/receiver-and-conversation/:conversationID', auth,async(req, res) => {
    try {
        const conID = req.params.conversationID;

        const conversations = await Conversation.findById(conID);

        // if there is no such conversation ID
        if (!conversations) {
            return res.status(404).send({ error: 'Not found'});
        }

        const user = await req.user.toJSON();
        const conMeta = user.conversations.find(val => val.conversation.toString() === conID);

        res.send({ conversationMeta: conMeta, conversations })
    } catch(e) {
        res.status(400).send('error');
    }
}) 
// search endpoint
// query should be like ?email=user@email.com
router.get('/search', async (req, res) => {
    const email = req.query.email;
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send({ error: 'Not Found'});
        }

        // convert user to JSON Object
        const aUser = await user.toJSON();

        // delete some sensitive data
        delete aUser.conversations;
        delete aUser.createdAt;
        delete aUser.updatedAt;

        res.send({ user: aUser });
    } catch(e) {
        res.status(400).send();
    }
})

// avatar relate route

router.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res) => {
    try {
        req.user.avatar = req.file.buffer;
        await req.user.save();
        res.send('Image has been upload')
    } catch(e) {
        res.status(400).send();
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(e) {
        res.status(500).send();
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.send({msg: 'Delete user avatar successfully'})
    } catch(e) {
        res.status(400).send();
    }
})


module.exports = router;
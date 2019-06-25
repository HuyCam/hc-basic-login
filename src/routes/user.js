const express = require('express');
const router = new express.Router();
const multer = require('multer');
const auth = require('../middlewares/auth');
// import models
const User = require('../models/user');

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

/* functions get only info that client can use*/
function customUser(user) {
    return {
            name: user.name,
            email: user.email,
            _id: user._id
        }
}

// get your profile
router.get('/users/me', auth, (req ,res) => {

    res.send(customUser(req.user));
});

// find a user by email. The query should be just include ?email=
router.get('/find/users', auth, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.query.email });

        if (!user) {
            return res.status(404).send();
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
        const aUser = customUser(user);
        res.status(201).send({ aUser, token });
    } catch(e) {
        res.status(400).send(e);
    }
});

// login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken(user.id.toString());

        const aUser = customUser(user);
        res.send({ aUser, token});
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
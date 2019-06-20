const express = require('express');
require('./db/mongoose');
const cors = require('cors');
const multer = require('multer');
const User = require('./models/user');
const path = require('path');

const auth = require('./middlewares/auth');
const port = process.env.PORT || 3001; 
const app = express();

app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// set up image upload
const upload = multer({
    limits: {
        fileSize: 400000
    },
    filter (req, file, cb) {
        if (!file.originalname.match(/(jpg|jpeg|png)/i)) {
            return cb(new Error('Please upload a file image'))
        }

        cb(undefined, true);
    }
})

// API live
app.get('/', (req, res) => {
    res.send('server is live');
})


// get your profile
app.get('/users/me', auth, (req ,res) => {

    res.send(customUser(req.user));
});

// create user
app.post('/users', async (req, res) => {
    
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
app.post('/users/login', async (req, res) => {
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
app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(doc => doc.token !== req.token);
        await req.user.save();
        res.send({ msg: 'Log out successfully. '});
    } catch(e) {
        res.status(500).send();
    }   
});

// logout all other devices
app.post('/users/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({ msg: 'Log out all successfully'});
    } catch(e) {
        res.status(400).send();
    }
})

app.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res) => {
    console.log(req.body);
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

app.get('/users/:id/avatar', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(e) {
        res.status(500).send();
        console.log(e);
    }
})

app.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.send({msg: 'Delete user avatar successfully'})
    } catch(e) {

    }
})
app.listen(port, () => {
    console.log(`Server is live at port ${port}`);
});

function customUser(user) {
    return {
            name: user.name,
            email: user.email,
            _id: user._id
        }
}
const express = require('express');
require('./db/mongoose');

const User = require('./models/user');

const auth = require('./middlewares/auth');
const port = process.env.PORT || 3001; 
const app = express();

app.use(express.json());

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
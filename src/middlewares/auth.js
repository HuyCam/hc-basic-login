const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {   
        const token = req.header('Authorization').replace('Bearer ', '');
        const decodeded = await jwt.verify(token, 'huyawesomeapp');
        const user = await User.findOne({ _id: decodeded._id, 'tokens.token': token })

        if (!user) {
            throw new Error();
        }
        //store token
        req.token = token;
        // add this user to req
        req.user = user;
        next();
    } catch(e) {
        res.status(401).send({ error: 'Please authenticate. '});
    }
}
module.exports = auth;

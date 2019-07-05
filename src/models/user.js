const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Invalid Email');
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    conversations: [{
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        isRead: {
            type: Boolean,
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.methods.generateToken = async function() {
    const user = this;

    const token = await jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: '300 seconds'});
    user.tokens.push({token});

    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error('Invalid login');
    }

    if (!(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid login');
    }

    return user;
}

userSchema.pre('save', async function(next) {
    const user = this;
    
    // if user create new password or new user is created
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.methods.toJSON = async function() {
    const user = this;
    await user.populate('conversations.receiver').execPopulate();
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    // delete some information in populated conversations
    userObject.conversations.forEach(con => {
        delete con.receiver.password;
        delete con.receiver.tokens;
        delete con.receiver.conversations;
        delete con.receiver.createdAt;
        delete con.receiver.updatedAt;
        delete con.receiver.avatar;
    })
    return userObject;

}

const User = mongoose.model('User', userSchema);

module.exports = User;
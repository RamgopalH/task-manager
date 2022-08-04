const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { nextTick } = require('process');

const jwtSecret = 'OobCePZ4gCwJiIisJ4sB8ut1iaSDiK73I9loyMI5V10lE5IEpyWB';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

/* Instance methods [On the Object] */

//Override Default toJSON method to not return the password or sessions while returning the user
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    return _.omit(userObj, ['password', 'sessions'])
}

UserSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "20s" }, (err, token) => {
            if (!err) resolve(token);
            else reject();
        })
    })
}

UserSchema.methods.generateRefreshAuthToken = function () {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buffer) => {
            if (!err) {
                let token = buffer.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function () {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDataBase(user, refreshToken)
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((err) => {
        return Promise.reject('Failed To Save Session To Database', err);
    })
}



/* Model Methos [Static] */

UserSchema.statics.getJWTSecret = function() {
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function (_id, token) {
    const User = this;

    return User.findOne({ _id, 'sessions.token': token });
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) resolve(user);
                else reject();
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    return (expiresAt < secondsSinceEpoch);
}

/* Middleware */

UserSchema.pre('save', function (next) { 
    let user = this;
    let costFactor = 10; //Number of times the hash Function is appplied
    if (user.isModified('password')) {
        //If password is changed, run this
        bcrypt.genSalt(costFactor, (err, salt) => {

            bcrypt.hash(user.password, salt, (err, hashedPassword) => {
                user.password = hashedPassword;
                next();
            })
        })
    } else {
        next();
    }
})

/* Helper Methods */

let saveSessionToDataBase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, 'expiresAt': expiresAt });

        user.save().then(() => {
            resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = function (params) {
    let minutesUntilExpire = '5';
    let secondsUntilExpire = minutesUntilExpire * 60;
    return (Date.now() / 1000) + secondsUntilExpire;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
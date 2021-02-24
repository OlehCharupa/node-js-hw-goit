const { Types: { ObjectId } } = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path")
const fs = require("fs").promises
const userModel = require("./user.model.js");
const { Conflict, Unauthorized, NotFound, Forbidden } = require("../helpers/error.constructors.js")
const avatarNewUser = require("../helpers/avatarGenerator.js")


async function signUp(userParams) {
    const { password, email } = userParams;
    const user = await userModel.findOne({ email });
    if (user) {
        throw new Conflict(`User with ${email} already exists`)
    }
    const saltRounds = parseInt(process.env.SALT_ROUNDS)
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    const avatarUrl = await avatarNewUser()
    const newUser = await userModel.create({
        avatarUrl,
        email,
        password: hashedPassword,
    });
    return newUser
}

async function signIn(credentials) {
    const { email, password } = credentials;
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new NotFound(`User with email ${email} was not found`)
    }
    const passwordResult = await bcryptjs.compare(password, user.password);
    if (!passwordResult) {
        throw new Forbidden(`Provided password is wrong`)
    }
    const token = jwt.sign({ userId: user._id },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN }
    );
    const updateUser = await userModel.findByIdAndUpdate(
        user._id,
        { token },
        { new: true }
    )
    return { token, updateUser }
}


async function logOut(userId) {
    const user = await userModel.findById(userId)
    if (!user) {
        throw new Unauthorized(`Not authorized`)
    }
    const updateUser = await userModel.findByIdAndUpdate(
        user._id,
        { token: null },
        { new: true }
    )
    return updateUser
}

async function currentUser(userId) {
    const user = await userModel.findById(userId)
    return user
}

async function updateAvatar(req) {
    console.log(req);
    const fileName = req.file.filename
    const newAvatarUrl = `http://localhost:${process.env.PORT}/images/${fileName}`
    const updateUser = await userModel.findByIdAndUpdate(
        req.user._id,
        { avatarUrl: newAvatarUrl },
        { new: true }
    )
    return updateUser
}

module.exports = {
    currentUser,
    logOut,
    signUp,
    signIn,
    updateAvatar
};
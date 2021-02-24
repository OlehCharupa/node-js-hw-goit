const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
    },
    subscription: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
    },
    token: String,
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel
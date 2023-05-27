const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URL);



const userSchema = mongoose.Schema({
    email: String,
    hash: String,
    salt: String,
    secret: String
});

const User = mongoose.model('user', userSchema);


module.exports.User = User;

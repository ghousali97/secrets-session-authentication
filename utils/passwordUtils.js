
const crypto = require('crypto')


module.exports.validatePassword = function (password, hash, salt) {
    var calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hash;
}

module.exports.generatePassword = function (password) {

    var salt = crypto.randomBytes(32).toString('hex');
    var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: hash
    };



}
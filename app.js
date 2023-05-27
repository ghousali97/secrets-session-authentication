//jshint esversion:6
require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
//const mongooseConnection = require('./config/database').connection;
const User = require('./config/database').User;
const MongoStore = require('connect-mongo');
const session = require('express-session');


const port = process.env.PORT || 3000;
const validatePassword = require('./utils/passwordUtils.js').validatePassword;
const genaratePassword = require('./utils/passwordUtils.js').generatePassword;



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


const sessionStore = new MongoStore({
    mongoUrl: process.env.DB_URL,
    collection: 'session'
});

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    name: "sessionID",
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 3600 * 24
    },
    resave: false
};


app.use(session(sessionConfig));


app.listen(port, function () {
    console.log("Server running on: " + port);
})

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render('login');
});
app.get('/secrets', isAuthenticated, function (req, res) {
    console.log('secret route');
    console.log(req.session);
    User.find({ secret: { $ne: null } }).then(function (users) {
        if (users) {
            res.render('secrets', { usersWithSecrets: users });
        } else {
            res.render('secrets', { usersWithSecrets: [{ secret: "default secrets" }] });
        }

    });

});
app.get('/register', function (req, res) {


    res.render('register');
});

app.get('/submit', isAuthenticated, function (req, res) {
    res.render('submit');
});


app.get('/logout', function (req, res) {
    req.session.user = null;
    req.session.save(function (err) {
        if (err) { next(err); }

        req.session.regenerate(function (err) {
            if (err) {
                next(err);
            }
            res.redirect('/login');
        });

    });

});
app.post('/register', function (req, res) {
    console.log(User);
    var email = req.body.username;
    var password = req.body.password;

    var hashSalt = genaratePassword(password);
    var newUser = new User({
        email: email,
        hash: hashSalt.hash,
        salt: hashSalt.salt
    });

    newUser.save().then(function (user) {
        console.log('user created:');
        res.redirect('/login');

    });
});


app.post('/login', function (req, res) {
    console.log(req.session);
    var email = req.body.username;
    var password = req.body.password;
    if (!email || !password) {
        res.status(401).send('Please enter username and password!');
    } else {
        User.findOne({ email: email }).then(function (user) {
            if (!user) {
                res.status(401).send('user does not exist!');
            } else {
                console.log(user);
                var isValid = validatePassword(password, user.hash, user.salt);
                if (isValid) {
                    //regnerate the session to protect against session fixation.
                    req.session.regenerate(function (err) {
                        if (err) next(err);
                        req.session.user = user.id;
                        //save the session before redireciton
                        req.session.save(function (err) {
                            if (err) return next(err)
                            res.redirect('/secrets');
                        });

                    });
                } else {
                    res.status(401).send('Incorrect username!');
                }
            }
        });
    }
});


app.post('/submit', isAuthenticated, function (req, res) {
    var secret = req.body.secret;
    User.findById(req.session.user).then(function (user) {
        user.secret = secret;
        user.save().then(function () {
            res.redirect('/secrets');
        });
    });
});
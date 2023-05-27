# secrets-session-authentication
A simple web application that supports user authentication using express-sessions

Setup:
1. git clone
2. npm i
3. create .env file and set DB_URL and SESSION_SECRET
4. nodemon app.js

Express Session:
1. First create a session store using mongo connect
2. Create a session options variable with secret string and cookie configuration. savUninitialized must be set to true to ensure that session is set even before login. Resave should be set as false to ensure session is not automatically save as it may lead to race condition when parallel requests are received. 
3. Set app to use the session middleware with session option as parameter
4. Create a mongoose connection, userSchema and user model.
5. Create password verification and hash generation function.
6. Create a simple user registration function
7. Create a login function (should regenerate session to prevent session fixation, populate session.user with userID and then save the session). It should be noted that session data is stored on server side only.
8. Create a middleware to check if user is authenticated and use it as last middleware before servign protect routes.
9. Create a logout function (set session.user as null, regenerate session to prevent an possibility of reuse, save session and redirect).

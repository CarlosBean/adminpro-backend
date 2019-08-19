// requires
const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');

//import routes
const appRoute = require('./routes/app');
const userRoute = require('./routes/user');
const loginRoute = require('./routes/login');

// initialize variables
const app = express();
const DB = 'hospitalDB';

// connection to DB
mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://localhost:27017/${DB}`, { useNewUrlParser: true },
    (err, res) => {
        if (err) throw err;
        console.log(`Database ${DB}: ${'online'.green}`);
    });

//routes
app.use('/login', loginRoute);
app.use('/user', userRoute);
app.use('/', appRoute);

// listen requests
app.listen(3000, () => {
    console.log(`Express server port 3000: ${'online'.green}`);
});
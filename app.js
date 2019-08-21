// requires
const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');

//import routes
const appRoute = require('./routes/app');
const userRoute = require('./routes/user');
const loginRoute = require('./routes/login');
const hospitalRoute = require('./routes/hospital');
const doctorRoute = require('./routes/doctor');
const searchRoute = require('./routes/search');
const uploadRoute = require('./routes/upload');
const imageRoute = require('./routes/images');

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
app.use('/img', imageRoute);
app.use('/upload', uploadRoute);
app.use('/search', searchRoute);
app.use('/doctor', doctorRoute);
app.use('/hospital', hospitalRoute);
app.use('/login', loginRoute);
app.use('/user', userRoute);
app.use('/', appRoute);

// listen requests
app.listen(3000, () => {
    console.log(`Express server port 3000: ${'online'.green}`);
});
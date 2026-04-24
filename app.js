require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

const connectDB = require('./config/db');
connectDB();

// BODY
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// VIEW
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// STATIC
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
const webRoutes = require('./routes/web');
app.use('/', webRoutes);

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
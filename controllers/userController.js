const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ===== SHOW =====
exports.showLogin = (req, res) => {
    res.render('user/login');
};

exports.showRegister = (req, res) => {
    res.render('user/register');
};

// ===== REGISTER =====
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.send('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // ✅ FIXED
        res.redirect('/user/login');

    } catch (err) {
        console.log(err);
        res.send('Register error');
    }
};

// ===== LOGIN =====
exports.loginUser = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send('Wrong password');

        req.session.user = user;

        if (remember) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        } else {
            req.session.cookie.expires = false;
        }

        // ✅ RETURN TO BOOK FLOW (KEEP SAME)
        if (req.session.serviceId) {
            const serviceId = req.session.serviceId;
            req.session.serviceId = null;
            return res.redirect(`/book/${serviceId}`);
        }

        // ✅ FIXED
        res.redirect('/user/dashboard');

    } catch (err) {
        console.log(err);
        res.send('Login error');
    }
};

// ===== DASHBOARD =====
exports.dashboard = async (req, res) => {
    try {
        if (!req.session.user) {
            // ✅ FIXED
            return res.redirect('/user/login');
        }

        const bookings = await Booking.find({ user: req.session.user._id })
            .populate('service');

        res.render('user/dashboard', { bookings });

    } catch (err) {
        console.log(err);
        res.send('Dashboard error');
    }
};

// ===== FORGOT =====
exports.showForgot = (req, res) => {
    res.render('user/forgot');
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("No user found");

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;

    await user.save();

    // ✅ FIXED
    res.send(`Reset Link: http://localhost:5000/user/reset/${token}`);
};

// ===== RESET =====
exports.showReset = async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.send("Invalid or expired token");

    res.render('user/reset', { token: req.params.token });
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;

    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.send("Invalid or expired token");

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    // ✅ FIXED
    res.redirect('/user/login');
};
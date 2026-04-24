const express = require('express');
const router = express.Router();

const multer = require('multer');

const bookingController = require('../controllers/bookingController');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminControllers');

const Service = require('../models/Service');
const { team } = require('./data');

// ===== MULTER =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// ===== HOME =====
router.get('/', async (req, res) => {
    const services = await Service.find();
    res.render('index', { services, team });
});

// ===== SERVICES =====
router.get('/services', async (req, res) => {
    const services = await Service.find();
    res.render('services', { services });
});

// ===== USER =====
router.get('/user/login', userController.showLogin);
router.post('/user/login', userController.loginUser);

router.get('/user/register', userController.showRegister);
router.post('/user/register', userController.registerUser);

router.get('/user/dashboard', userController.dashboard);

router.get('/user/forgot', userController.showForgot);
router.post('/user/forgot', userController.forgotPassword);

router.get('/user/reset/:token', userController.showReset);
router.post('/user/reset/:token', userController.resetPassword);

// ===== BOOK =====
router.get('/book/:id', bookingController.showConfirmPage);
router.post('/book/:id', bookingController.confirmBooking);

// ===== ADMIN =====
router.get('/admin/login', adminController.showLogin);
router.post('/admin/login', adminController.login);

router.get('/admin/dashboard', adminController.dashboard);
router.get('/admin/logout', adminController.logout);

router.get('/admin/service/add', adminController.showAddService);
router.post('/admin/service/add', upload.single('image'), adminController.addService);

router.get('/admin/services', adminController.getServices);

module.exports = router;
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// ===== SHOW CONFIRM PAGE =====
exports.showConfirmPage = async (req, res) => {
    try {
        const serviceId = req.params.id;

        // ✅ FIXED: use /user/login
        if (!req.session.user) {
            req.session.serviceId = serviceId;
            return res.redirect('/user/login');
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.send('Service not found');

        res.render('user/confirmBooking', { service });

    } catch (err) {
        console.log(err);
        res.send('Error loading confirmation page');
    }
};

// ===== CONFIRM BOOKING =====
exports.confirmBooking = async (req, res) => {
    try {
        const serviceId = req.params.id;

        // ✅ FIXED
        if (!req.session.user) {
            return res.redirect('/user/login');
        }

        const booking = new Booking({
            user: req.session.user._id,
            service: serviceId
        });

        await booking.save();

        // ✅ CORRECT
        res.redirect('/user/dashboard');

    } catch (err) {
        console.log(err);
        res.send('Booking error');
    }
};
const Admin = require('../models/Admin');
const Service = require('../models/Service');

// ================= AUTH =================

exports.showLogin = (req, res) => {
    res.render('admin/login');
};

exports.showRegister = (req, res) => {
    res.render('admin/register');
};

exports.register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const existingUser = await Admin.findOne({ email });
        if (existingUser) return res.send("User already exists");

        const newUser = new Admin({ fullname, email, password });
        await newUser.save();

        req.session.user = newUser;
        res.redirect('/admin/dashboard');

    } catch (err) {
        console.error(err);
        res.send("Registration error");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await Admin.findOne({ email });

    if (!user) return res.send("User not found");
    if (user.password !== password) return res.send("Wrong password");

    req.session.user = user;
    res.redirect('/admin/dashboard');
};

exports.dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/admin/login');

    res.render('admin/dashboard', {
        user: req.session.user
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
};

// ================= SERVICES =================

exports.showAddService = (req, res) => {
    res.render('admin/addService');
};

exports.addService = async (req, res) => {
    try {
        const { title, price } = req.body;

        const newService = new Service({
            title,
            price,
            image: req.file ? req.file.filename : null
        });

        await newService.save();
        res.redirect('/admin/services');

    } catch (err) {
        console.error(err);
        res.send("Error adding service");
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.render('admin/listServices', { services });

    } catch (err) {
        console.error(err);
        res.send("Error fetching services");
    }
};

exports.editServicePage = async (req, res) => {
    const service = await Service.findById(req.params.id);
    res.render('admin/editService', { service });
};

exports.updateService = async (req, res) => {
    try {
        const { title, price } = req.body;

        const updateData = { title, price };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        await Service.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/services');

    } catch (err) {
        console.error(err);
        res.send("Error updating service");
    }
};

exports.deleteService = async (req, res) => {
    await Service.findByIdAndDelete(req.params.id);
    res.redirect('/admin/services');
};

// ================= HOME =================

exports.getAllServicesForHome = async (req, res) => {
    try {
        const services = await Service.find();

        const { about, team } = require('../routes/data'); // ✅ correct place

        res.render('index', {
            services,
            about,
            team
        });

    } catch (err) {
        console.error(err);
        res.send("Error loading homepage");
    }
};
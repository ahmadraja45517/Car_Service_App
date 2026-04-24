const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: String,
    price: Number,
    image: String
});

// ✅ FIX: prevent overwrite error
module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
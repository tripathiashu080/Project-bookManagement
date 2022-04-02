const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^(\+\d{1,3}[- ]?)?\d{10}$/   // validate mobile number using Regex
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, // email validation using Regex
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/,  // Password validation using Regex
        minlength: 8,
        maxlength: 15
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
},
    { timestamps: true });

module.exports = mongoose.model('User', userSchema);
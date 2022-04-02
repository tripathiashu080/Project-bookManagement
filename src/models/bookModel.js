const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    ISBN: {
        type: String,
        required: true,
        unique: true,
        match: /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: [
        {
            type: String,
            required: true,
            trim: true
        }
    ]

    ,
    reviews: {
        type: Number,
        default: 0, // comment: Number

    },
    deletedAt: Date,  //when the document is deleted
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: true,  // format("YYYY-MM-DD") 
    },
},
    { timestamps: true });

module.exports = mongoose.model('Book', bookSchema); 
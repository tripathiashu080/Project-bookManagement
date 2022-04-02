const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        ref: 'Book'
    },
    reviewedBy: {
        type: String,    // value: reviewer's name
        required: true,
        default: "Guest",
    },
    reviewedAt: {
        type: Date,
        reuired: true
    },
    rating: {
        type: Number,
        minlength: 1,
        maxlength: 5,
        required: true
    },
    review: {
        type: String,    //optional
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model('Review', reviewSchema);
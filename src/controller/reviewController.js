const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel')
const { isValid, isValidRequestBody, isValidObjectId, isValid2 } = require('../validator/validator');

const addReview = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid Request parameters. Please provide review details" })
        }
        const { bookId, reviewedBy, reviewedAt, rating, review } = requestBody;

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, message: 'bookId is required' })
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book data not found !` });
        }

        if (  !isValid(reviewedBy)) {
            return res.status(400).send({ status: false, message: 'reviewedBy is required' })
        }
        if (reviewedBy && !isValid(reviewedAt)) {
            return res.status(400).send({ status: false, message: 'reviewedAt is required' })
        }
        if (!(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(reviewedAt))) {
            return res.status(400).send({ status: false, message: "Plz provide valid released Date" })

        }
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: 'rating is required' })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Rating should be 1 to 5" });
        }
        const reviewsData = { bookId, reviewedBy, reviewedAt, rating, review: review };
        const reviewDetails = await reviewModel.create(reviewsData);
        res.status(201).send({ status: true, count: reviewDetails.length, message: "Success", data: reviewDetails });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const updateReview = async (req, res) => {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide some data to update this Book" });
            return;
        }
        const { review, rating, reviewedBy } = requestBody

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        const isBookIdPresent = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!isBookIdPresent) {
            res.status(404).send({ status: false, message: `Book data not found !` });
            return;
        }
        const isReviewIdPresent = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!isReviewIdPresent) {
            res.status(404).send({ status: false, message: `Review data not found !` });
            return;
        }
        if (isReviewIdPresent.bookId != bookId) {
            return res.status(401).send({ status: false, message: "You can't update review " })
        }
        if (!isValid2(rating)) {
            return res.status(400).send({ status: false, message: 'rating is required' })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Rating should be 1 to 5" });
        }
        if (!isValid2(reviewedBy)) {
            return res.status(400).send({ status: false, message: 'reviewedBy is required' })
        }
        const reviewData = await reviewModel.findByIdAndUpdate(reviewId, requestBody, { new: true }).select({isDeleted: 0, __v:0})
        const bookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        res.status(200).send({ status: true, message: "Review updated successfully", data: reviewData });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }

}

const deleteReview = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const details = {
            isDeleted: false,
            _id: req.params.reviewId
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        const isBookIdPresent = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!isBookIdPresent) {
            res.status(404).send({ status: false, message: `Book data not found !` });
            return;
        }
        const isReviewIdPresent = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!isReviewIdPresent) {
            res.status(404).send({ status: false, message: `Review data not found !` });
            return;
        }
        if (isReviewIdPresent.bookId != bookId) {
            return res.status(401).send({ status: false, message: "You can't update review " })
        }

        const deletedReview = await reviewModel.findOneAndUpdate(details, { isDeleted: true, deletedAt: new Date() })
        res.status(200).send({ status: true, msg: 'Review is successfully deleted' })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });

    }
}

module.exports = { addReview, updateReview, deleteReview }
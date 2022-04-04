const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose');
const { isValid, isValidRequestBody, isValidObjectId } = require('../validator/validator');
const ObjectId = mongoose.Types.ObjectId;
const dateRegex = /^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/


const createBook = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid Request parameters. Please provide Book details' })
        }
        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = req.body;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required' })
        }
        const titleExist = await bookModel.findOne({ title });
        if (titleExist) {
            return res.status(400).send({ status: false, message: "Title already exists" })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'excerpt is required' })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'userId is required' })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        const id = await userModel.findById(userId);
        if (!id) {
            return res.status(404).send({ status: false, message: "userId not found" });
        }
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        }

        const ISBNexist = await bookModel.findOne({ ISBN });
        if (ISBNexist) {
            return res.status(400).send({ status: false, message: "ISBN  already exists" })
        }

        if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))) {
            return res.status(400).send({ status: false, message: 'ISBN should be valid ISBN' })

        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'category is required' })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: 'subcategory is required' })
        }
        if (!(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(releasedAt))) {
            res.status(400).send({ status: false, message: "Plz provide valid released Date" })
            return
        }
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: 'releasedAt is required' })
        }
        if (req.user !== userId) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }

        const newBook = { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt }

        const bookCreated = await bookModel.create(newBook)
        res.status(201).send({ status: true, message: "Success", data: bookCreated })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

const getBooksDetails = async (req, res) => {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null }
        const queryParams = req.query;
        if (isValidRequestBody(queryParams)) {
            const { userId, category, subcategory } = queryParams;
            if (isValid(userId) && isValidObjectId(userId)) {
                filterQuery['userId'] = userId
            }
            if (isValid(category)) {
                filterQuery['category'] = category
            }
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim())
                filterQuery['subcategory'] = { $all: subcatArr }
            }
        }
        const books = await bookModel.find(filterQuery,
            '-createdAt -updatedAt -isDeleted -subcategory -__v -ISBN')
        books.sort(function (a, b) {
            return a.title.localeCompare(b.title)
        })
        if (Array.isArray(books) && books.length === 0) {
            return res.status(404).send({ status: false, message: "No books found" })
        }
        res.status(200).send({ status: true, count: books.length, message: "Books list", data: books })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}
const getBooksById = async (req, res) => {
    try {

        const bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        const books = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!books) {
            return res.status(404).send({ status: false, message: "Book not found" })
        }
        const { title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt } = books

        const bookData = { _id: bookId, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt }

        const reviewDetails = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted: 0, __v: 0 });

        if (reviewDetails) {
            bookData.reviewsData = reviewDetails
        }
        res.status(200).send({ status: true, message: "Books list", count: reviewDetails.length, data: bookData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }
}


const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const requestBody = req.body

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid BookId" });
        }
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide some data to update this Book" });
            return;
        }
        const isBookIdPresent = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!isBookIdPresent) {
            res.status(404).send({ status: false, message: `Book data not found with this Id ${bookId}` });
            return;
        }

        if (req.user != isBookIdPresent.userId) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }
        const { title, ISBN, excerpt, releasedAt } = req.body

        const updateBookData = {};
        if ("title" in req.body) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Please provide a valid title" })
            }
            const isTitlePresent = await bookModel.findOne({ title });
            if (isTitlePresent) {
                return res.status(400).send({ status: false, message: "Book Title is already exist you can't update it" });
            }
            if (!('$set' in updateBookData)) {
                updateBookData["$set"] = {}
            }
            updateBookData["$set"]["title"] = title
        }
        if ('ISBN' in req.body) {
            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, message: "Please provide a valid ISBN" })
            }
            const isISBNPresent = await bookModel.findOne({ ISBN });
            if (isISBNPresent) {
                return res.status(400).send({ status: false, message: "ISBN no. is already exist you can't update it" });
            }
            if (!('$set' in updateBookData)) {
                updateBookData["$set"] = {}
            }
            updateBookData['$set']['ISBN'] = ISBN
        }
        if ("excerpt" in req.body) {
            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, message: "Please provide a valid excerpt" })
            }
            if (!('$set' in updateBookData)) {
                updateBookData["$set"] = {}
            }
            updateBookData['$set']['excerpt'] = excerpt
        }
        if ("releasedAt" in req.body) {
            if (!isValid(releasedAt)) {
                return res.status(400).send({ status: false, message: "Please provide a valid releasedAt date" })
            }
            if (!dateRegex.test(releasedAt)) {
                return res.status(400).send({ status: false, message: "Please provide valid releasedAt Date" })
            }
            if (!('$set' in updateBookData)) {
                updateBookData["$set"] = {}
            }
            updateBookData['$set']['releasedAt'] = releasedAt
        }
        const bookData = await bookModel.findOneAndUpdate({ _id: bookId }, updateBookData, { new: true })
        res.status(200).send({ status: true, message: "Book updated successfully", data: bookData });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const deletedById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.bookId)) {
            return res.status(400).send({ status: false, msg: "Invalid Bookid" })
        }
        const details = {
            isDeleted: false,
            _id: req.params.bookId
        }
        const book = await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, msg: 'Book not found' })
        }
        if (req.user != book.userId) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }

        const deletedBook = await bookModel.findOneAndUpdate(details, { isDeleted: true, deletedAt: new Date() })
        res.status(200).send({ status: true, msg: 'Book is successfully deleted' })

    } catch (err) {
        res.status(500).send({ satus: false, err: err.message })
    }
}


module.exports = { createBook, getBooksDetails, getBooksById, updateBook, deletedById }
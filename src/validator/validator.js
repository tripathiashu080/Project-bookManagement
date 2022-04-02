const mongoose = require('mongoose');

const isValid = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = (requestBody) => {
    if (Object.keys(requestBody).length) return true
    return false;
}
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const isValid2 = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

module.exports = { isValid, isValidRequestBody, isValid2, isValidObjectId }
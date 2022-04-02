const mongoose = require('mongoose');

const isValid = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true;
}
const isValidRequestBody = (requestBody) => {
   return Object.keys(requestBody).length > 0
}
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValid2 = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

module.exports = { isValid, isValidRequestBody, isValid2,  isValidObjectId }
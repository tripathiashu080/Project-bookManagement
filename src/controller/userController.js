const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { isValid, isValidRequestBody } = require('../validator/validator');

const createUser = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        const { title, name, phone, email, password, address } = req.body

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required' })
        }

        if (["Mr", "Mrs", "Miss"].indexOf(title) === -1) {
            return res.status(400).send({ status: false, msg: "Plz enter vaild Title" })
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'name is required' })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'phone is required' })
        }
        if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone))) {
            return res.status(400).send({ status: false, message: 'phone number should be valid mobile number' })

        }
        const phoneAlreadyUsed = await userModel.findOne({ phone })
        if (phoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} number already registered` })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is required' })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be valid email' })

        }
        const emailAlreadyUsed = await userModel.findOne({ email })
        if (emailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} is already registered` })

        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }

        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: 'password should be valid password' })

        }
        const newUser = { title: title, name: name, phone: phone, email: email, password: password, address: address }

        const userCreated = await userModel.create(newUser)
        res.status(201).send({ status: true, message: "Success", data: userCreated })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const userLogin = async (req, res) => {
    try {
        const loginDetails = req.body;

        if (!isValidRequestBody(loginDetails)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        const { email, password } = req.body;
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is required' })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be valid email' })

        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }

        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: 'password should be valid password' })

        }

        const user = await userModel.findOne({ email, password });
        if (!user) {
            return res.status(404).send({
                'status': false,
                message: 'Email and Password not found ' // wrong email id
            });
        }

        if (!user.password) {
            return res.status(404).send({
                'status': false,
                message: 'Email and Password not found ' // wrong password
            });
        }

        const token = jwt.sign({
            id: user._id
        }, 'Group28', { expiresIn: 60 * 60 });
        res.setHeader("x-api-key", token);
        return res.status(200).send({ 'status': true, message: "Success", data: token });


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }

}

module.exports = { createUser, userLogin }
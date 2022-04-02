const jwt = require('jsonwebtoken');
const bookModel = require('../models/bookModel');

// let authentication = async function (req, res, next) {
//     try {
//         let token = req.headers['x-api-key']
//         if (!token) {
//             return res.status(400).send({ msg: "Token must be present" });
//         }
//         next()
//     }
//     catch (err) {
//         res.status(500).send({ error: err.message })
//     }
// }



const mid1 = async function (req, res, next) {
    try {
      //Authentication
      const token = req.headers["x-api-key"];
      if (!token) {
        return res.status(401).send({ status: false, msg: "token must be present" });
      }
      //Authorization
      const decodedToken = jwt.verify(token, "Group28");
  
      req.user = decodedToken.id;
      next();
      // console.log(req.user)
    } catch (err) {
      res.status(500).send({ status: false, msg: err.message });
    }
  };

module.exports = {  mid1 }
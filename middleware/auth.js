const jwt = require("jsonwebtoken");

//protection des variables d'environnement
require("dotenv").config();

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY); 
        const userId = decodedToken.userId;
        req.auth = {
            userId: process.env.AUTH_USERID 
        };
        next();
    } 
    catch(error) {
         res.status(401).json( { error })
    }
};

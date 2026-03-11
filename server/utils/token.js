const jwt = require("jsonwebtoken"); 

const newToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

module.exports = newToken;
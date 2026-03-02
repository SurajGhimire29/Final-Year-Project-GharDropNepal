const jwt = require("jsonwebtoken"); 

const newToken = async (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

module.exports = newToken;
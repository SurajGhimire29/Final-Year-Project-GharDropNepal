const express = require("express");
const { signUp, signIn, signOut, verifyOTP } = require("../controller/authController");
const sendOTPEmail = require("../utils/nodemailer");
const authRouter = express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.post("/signout",signOut)
authRouter.post("/emailotpverification", verifyOTP )

module.exports = authRouter

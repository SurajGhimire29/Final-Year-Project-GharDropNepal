require("dotenv").config()
const mongoose = require("mongoose");


exports.connectDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("✅ Database connected: Ghar Drop Nepal");
        
        
    } catch (error) {
        console.error("Mongodb connection failed",error.message)
        process.exit(1);//stop app if database is down
    }
};
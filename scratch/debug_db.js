const mongoose = require('mongoose');
const Withdrawal = require('./server/model/withDrawModel');

async function checkDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ghardrop', { useNewUrlParser: true, useUnifiedTopology: true });
        const bannerFees = await Withdrawal.find({ type: "Banner Fee", status: "Completed" });
        console.log("FOUND COMPLETED BANNER FEES:", bannerFees.length);
        bannerFees.forEach(f => console.log(`- Amount: ${f.amount}, Vendor: ${f.vendor}`));
        
        const allWithdrawals = await Withdrawal.find({});
        console.log("TOTAL WITHDRAWAL RECORDS IN DB:", allWithdrawals.length);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();

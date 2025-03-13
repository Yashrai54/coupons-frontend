const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

let couponIndex = 0;
const availableCoupons = ["SAVE10", "WELCOME5", "DISCOUNTCOUPONS", "FREESHIP"];

router.post("/claim", async (req, res) => {
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // **Step 1: Check database for 1-hour restriction**
    const lastClaim = await Coupon.findOne({ assignedTo: userIp });
    if (lastClaim && (Date.now() - lastClaim.assignedAt < 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Try again later! (1-hour block active)" });
    }

    // **Step 2: Assign a coupon & save in DB**
    const couponCode = availableCoupons[couponIndex];
    couponIndex = (couponIndex + 1) % availableCoupons.length;

    await Coupon.create({ code: couponCode, assignedTo: userIp, assignedAt: new Date() });

    res.json({ message: "Coupon claimed!", coupon: couponCode });
});

module.exports = router;

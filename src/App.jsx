const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

let couponIndex = 0;
const availableCoupons = ["SAVE10", "WELCOME5", "DISCOUNTCOUPONS", "FREESHIP"];
const recentClaims = new Map(); // Store recent claims with timestamps

router.post("/claim", async (req, res) => {
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // **Step 1: Block claims in same session**
    if (recentClaims.has(userIp)) {
        return res.status(429).json({ message: "Try again later! (Session block)" });
    }

    // **Step 2: Check in database for 1-hour restriction**
    const lastClaim = await Coupon.findOne({ assignedTo: userIp });
    if (lastClaim && (Date.now() - lastClaim.assignedAt < 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Try again later! (1-hour block)" });
    }

    // **Step 3: Assign a coupon & save in DB**
    const couponCode = availableCoupons[couponIndex];
    couponIndex = (couponIndex + 1) % availableCoupons.length;
    await Coupon.create({ code: couponCode, assignedTo: userIp, assignedAt: new Date() });

    // **Step 4: Temporarily block user in memory for 10 seconds**
    recentClaims.set(userIp, Date.now());
    setTimeout(() => recentClaims.delete(userIp), 10000); // Unblock after 10 sec

    res.json({ message: "Coupon claimed!", coupon: couponCode });
});

module.exports = router;

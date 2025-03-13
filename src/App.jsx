import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function App() {
    const [coupon, setCoupon] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [nextClaimTime, setNextClaimTime] = useState(null);

    const claimCoupon = async () => {
        setLoading(true);
        try {
            const res = await axios.post("https://coupons-backend-jxqa.onrender.com/api/coupons/claim", {}, { withCredentials: true });
            setCoupon(res.data.coupon);
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error claiming coupon");

            if (err.response?.status === 429) {
                const retryAfter = 60 * 60 * 1000; // 1 hour
                setNextClaimTime(Date.now() + retryAfter);
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Claim Your Coupon</h1>

            <button 
                onClick={claimCoupon} 
                disabled={loading || message.includes("Try again later")}
                className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md 
                           hover:bg-blue-700 transition-all duration-200 ease-in-out disabled:bg-gray-400"
            >
                {loading ? "Claiming..." : message.includes("Try again later") ? "Wait to Claim Again" : "Claim Coupon"}
            </button>

            {coupon && (
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 text-xl font-semibold text-green-600"
                >
                    Your Coupon: {coupon}
                </motion.p>
            )}

            <p className={`mt-4 text-lg ${message.includes("coupon") ? "text-green-600" : "text-red-500"}`}>
                {message}
            </p>

            {nextClaimTime && (
                <p className="text-yellow-600 mt-2">
                    You can claim again in {Math.ceil((nextClaimTime - Date.now()) / 60000)} minutes
                </p>
            )}
        </div>
    );
}

export default App;

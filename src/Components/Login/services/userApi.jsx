// services/walletService.js
import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define wallet-related service endpoints
const WalletServices = {
    getWalletBalance: `${baseURL}/user/wallet-balance`,

};

// ✅ Get user wallet balance
export const getWalletBalance = async () => {
    try {
        // Get auth token - adjust based on your auth implementation
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(WalletServices.getWalletBalance, {
            headers: {
                "Content-Type": "application/json",
                // Adjust authorization header format based on your API requirements
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        // API response format - handle your specific structure
        const walletData = res.data.data || res.data.wallet || res.data;
        const balance = walletData.balance || walletData.walletBalance || walletData.amount || 0;

        return {
            success: true,
            data: walletData,
            balance: balance,
            message: "Wallet balance fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching wallet balance:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch wallet balance",
            error: err,
            balance: 0
        };
    }
};

// ✅ Wallet utility functions
export const WalletUtils = {
    // Format currency for display
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    },

    // Format amount without currency symbol
    formatAmount: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    }
};

// ✅ Export default object for backward compatibility
const WalletService = {
    getWalletBalance,
    formatCurrency: WalletUtils.formatCurrency,
    formatAmount: WalletUtils.formatAmount,
};

export default WalletService;
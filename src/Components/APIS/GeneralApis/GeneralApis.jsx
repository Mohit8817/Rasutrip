import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define form-related service endpoints
const FormServices = {
    submitQuery: `${baseURL}/query/sumbit`,
};

// ✅ Submit enquiry form (query)
export const submitEnquiry = async (payload) => {
    try {
        const res = await axios.post(FormServices.submitQuery, payload, {
            headers: { "Content-Type": "application/json" },
        });

        // API response format
        return res.data;
    } catch (err) {
        console.error("❌ Error submitting enquiry:", err.response?.data || err.message);
        throw err; // so UI can also handle error
    }
};

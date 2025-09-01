import React, { useState } from "react";
import { submitEnquiry } from "../APIS/GeneralApis/GeneralApis";

const EnquiryForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        message: "",
        queryType: "booking_query",
    });

    const [responseMsg, setResponseMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponseMsg("");
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            // Call the actual API
            const response = await submitEnquiry(formData);

            // Show success message from API response
            setResponseMsg(response.message || "Query submitted successfully!");

            // Reset form after success
            setFormData({
                name: "",
                email: "",
                mobile: "",
                message: "",
                queryType: "booking_query",
            });
        } catch (err) {
            // Handle different types of errors
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to submit query. Please try again later.";
            setErrorMsg(`❌ ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className=" items-center justify-center m-auto p-4">
            <div className="w-full max-w-lg m-auto jsustify-center bg-white">
                {/* Header */}
                <div className="text-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Enquiry Form</h2>
                    <p className="text-gray-500 text-xs">Get in touch with us</p>
                </div>

                {/* Success & Error Messages */}
                {responseMsg && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                        <p className="text-green-700 text-xs">✅ {responseMsg}</p>
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-center">
                        <p className="text-red-700 text-xs">{errorMsg}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-3">
                    {/* Name Field */}
                    <div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            placeholder="Your name"
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="Your email"
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                    </div>

                    {/* Mobile Field */}
                    <div>
                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            placeholder="Mobile number"
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                    </div>

                    {/* Query Type Field */}
                    <div>
                        <select
                            name="queryType"
                            value={formData.queryType}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                            <option value="booking_query">Booking Query</option>
                            <option value="join_as_agent">Join as Agent</option>
                            <option value="support">Support</option>
                        </select>
                    </div>

                    {/* Message Field */}
                    <div>
                        <textarea
                            name="message"
                            rows={2}
                            value={formData.message}
                            placeholder="Your message"
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.name || !formData.email || !formData.mobile || !formData.message}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded text-sm transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnquiryForm;
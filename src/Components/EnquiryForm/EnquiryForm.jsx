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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Enquiry Form</h2>
                    <p className="text-gray-600 text-sm mt-1">Get in touch with us</p>
                </div>

                {/* Success & Error Messages */}
                {responseMsg && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm">✅ {responseMsg}</p>
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{errorMsg}</p>
                    </div>
                )}

                {/* Form */}
                <div className="">
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                placeholder="Enter your name"
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                placeholder="Enter your email"
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
                            />
                        </div>

                        {/* Mobile Field */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile
                            </label>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                placeholder="Enter your mobile number"
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
                            />
                        </div>

                        {/* Query Type Field */}
                        <div>
                            <label htmlFor="queryType" className="block text-sm font-medium text-gray-700 mb-1">
                                Query Type
                            </label>
                            <select
                                id="queryType"
                                name="queryType"
                                value={formData.queryType}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
                            >
                                <option value="booking_query">Booking Query</option>
                                <option value="join_as_agent">Join as Agent</option>
                                <option value="support">Support</option>
                            </select>
                        </div>

                        {/* Message Field */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={3}
                                value={formData.message}
                                placeholder="Enter your message"
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none disabled:opacity-50"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name || !formData.email || !formData.mobile || !formData.message}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 text-sm disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnquiryForm;
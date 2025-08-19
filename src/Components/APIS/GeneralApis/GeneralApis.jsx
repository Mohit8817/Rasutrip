import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define blog-related service endpoints
const BlogServices = {
    getAllBlogs: `${baseURL}/user/blog`,
    getBlogById: (id) => `${baseURL}/user/blog-by-id/${id}`,
};

// ✅ Define form-related service endpoints
const FormServices = {
    submitQuery: `${baseURL}/query/sumbit`,
};

// ✅ Get all blogs
export const getAllBlogs = async () => {
    try {
        const res = await axios.get(BlogServices.getAllBlogs, {
            headers: { "Content-Type": "application/json" },
        });
        // API response format - handle your specific structure
        const blogs = res.data.blogs || res.data.data || res.data || [];
        return {
            success: true,
            data: Array.isArray(blogs) ? blogs : [],
            message: "Blogs fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching blogs:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch blogs",
            error: err
        };
    }
};

// ✅ Get blog by ID
export const getBlogById = async (blogId) => {
    try {
        const res = await axios.get(BlogServices.getBlogById(blogId), {
            headers: { "Content-Type": "application/json" },
        });
        // API response format - handle your specific structure
        const blog = res.data.data || res.data.blog || res.data;
        return {
            success: true,
            data: blog,
            message: "Blog fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching blog by ID:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch blog details",
            error: err
        };
    }
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
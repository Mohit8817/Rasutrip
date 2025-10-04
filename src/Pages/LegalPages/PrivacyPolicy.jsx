import React from "react";
import { Container } from "react-bootstrap";

const PrivacyPolicy = () => {
    return (
        <Container className="terms-wrapper">
            <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-800">
                    Privacy Policy – RASUTRIP.com
                </h2>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 mb-6">
                        At <strong>RASUTRIP.com</strong>, we value your privacy and are
                        committed to protecting your personal information. This Privacy Policy
                        explains how we collect, use, and safeguard your data when you use our
                        website and mobile application.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        Scope of This Policy
                    </h3>
                    <p className="text-gray-700 mb-4">
                        This policy applies to all users of RASUTRIP services, including our
                        apps, website, and features (collectively, the "RASUTRIP Platform").
                        By using our services, you agree to the terms described here.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        Information We Collect
                    </h3>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                        Account Information
                    </h4>
                    <p className="text-gray-700 mb-4">
                        When you create an account, we may collect:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Name and contact details (email, phone number)</li>
                        <li>Password and login credentials</li>
                        <li>Payment information for bookings</li>
                        <li>Profile photo (optional, uploaded by you using Android Photo Picker)</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                        Usage Information
                    </h4>
                    <p className="text-gray-700 mb-4">
                        We collect information about your activity on the app such as:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Bookings made (bus, flight, hotel)</li>
                        <li>Searches and preferences</li>
                        <li>App performance data (crash logs, device type)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        Permissions Required
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Our mobile app may request limited permissions for proper functioning:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Camera / Photo Picker:</strong> Only when you update your profile picture. We use the Android system photo picker and do not require broad gallery access.</li>
                        <li><strong>Internet:</strong> For booking services and app features.</li>
                    </ul>
                    <p className="text-sm text-gray-600 italic mb-4">
                        Note: We do not access photos, videos, or files in the background. 
                        Any photo access is one-time and initiated only by you while updating your profile.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        How We Use Your Information
                    </h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>To provide bus, flight, and hotel booking services</li>
                        <li>To process payments securely</li>
                        <li>To personalize your booking experience</li>
                        <li>To send updates about your bookings</li>
                        <li>To improve app performance and security</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        Data Sharing
                    </h3>
                    <p className="text-gray-700 mb-4">
                        We do not sell your personal data. Information is shared only with:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Travel service providers (bus operators, airlines, hotels) to complete your booking</li>
                        <li>Payment gateways for transactions</li>
                        <li>Legal authorities if required by law</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Your Choices</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>You may update or delete your profile anytime</li>
                        <li>You can deny camera permission through device settings</li>
                        <li>You can request deletion of your account by contacting us</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Children's Data</h3>
                    <p className="text-gray-700 mb-4">
                        Our services are not intended for children under 13, and we do not knowingly collect their data.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Contact Us</h3>
                    <p className="text-gray-700 mb-4">
                        If you have any questions about this Privacy Policy, please contact us
                        at <strong>yourapp@rasutrip.com</strong>.
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;

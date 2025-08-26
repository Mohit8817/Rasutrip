import React from "react";
import { Container } from "react-bootstrap";

const PrivacyPolicy = () => {
    return (
        <Container className="terms-wrapper">
            <div className="">
                <h2 className="text-3xl font-bold  mb-8 text-gray-800">
                    Privacy Policy – RASUTRIP.com
                </h2>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 mb-6">
                        At <strong>RASUTRIP.com</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website and mobile application.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">The Scope of This Policy</h3>
                    <p className="text-gray-700 mb-4">
                        This policy applies to all RASUTRIP users, including Riders and Drivers (including Driver applicants), and to all RASUTRIP platforms and services, including our apps, websites, features, and other services (collectively, the "RASUTRIP Platform"). Please remember that your use of the RASUTRIP Platform is also subject to our Terms of Service.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">The Information We Collect</h3>
                    <p className="text-gray-700 mb-4">
                        When you use the RASUTRIP Platform, we collect the information you provide, usage information, and information about your device. We also collect information about you from other sources like third-party services, and optional programs in which you participate, which we may combine with other information we have about you.
                    </p>

                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">A. Information You Provide to Us</h3>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Account Registration</h4>
                    <p className="text-gray-700 mb-4">
                        When you create an account with RASUTRIP, we collect information including:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Name and contact details (e.g., email address, phone number)</li>
                        <li>Birth date and payment information</li>
                        <li>Demographic information such as preferences and interests</li>
                        <li>Photo or saved addresses (e.g., home or work)</li>
                        <li>Preferred pronouns and other preferences</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Driver Information</h4>
                    <p className="text-gray-700 mb-4">
                        If you apply to be a Driver, we collect:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Personal information (name, email, phone, birth date, profile photo, physical address)</li>
                        <li>Government identification number (such as social security number)</li>
                        <li>Driver's license information, vehicle information, and car insurance information</li>
                        <li>Payment information including bank routing numbers and tax information</li>
                        <li>Additional business license or permit information as required by location</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Additional Information</h4>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Location data, if permission is granted</li>
                        <li>Media files (photos, videos) for profile or travel submissions</li>
                        <li>Contact information if you choose to sync or share referrals</li>
                        <li>SOS Contact Information - contact list permission for emergency contacts</li>
                        <li>Ratings and feedback about Riders or Drivers</li>
                        <li>Communications when you contact us or we contact you</li>
                    </ul>

                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">B. Information We Collect When You Use the RASUTRIP Platform</h3>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Location Information</h4>
                    <p className="text-gray-700 mb-4">
                        Great rides start with easy and accurate pickup. The RASUTRIP Platform collects location information (including GPS and WiFi data) differently depending on your app settings and device permissions:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Riders:</strong> We collect your device's precise location when you open and use the RASUTRIP app, including while running in the background from when you request a ride until it ends.</li>
                        <li><strong>Drivers:</strong> We collect precise location when you open and use the app, including while running in the background when in driver mode, and for a limited time after you exit driver mode to detect ride incidents.</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Usage Information</h4>
                    <p className="text-gray-700 mb-4">We collect information about your use of the RASUTRIP Platform, including:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Ride information (date, time, destination, distance, route, payment)</li>
                        <li>Promotional or referral code usage</li>
                        <li>Interactions with apps and websites</li>
                        <li>Pages and content you view</li>
                        <li>Usage data and device information to improve app performance</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Device Information</h4>
                    <p className="text-gray-700 mb-4">We collect information about devices used to access the RASUTRIP Platform:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Device model, IP address, browser type, operating system version</li>
                        <li>Carrier and manufacturer identity, radio type (such as 4G)</li>
                        <li>Preferences and settings (such as preferred language)</li>
                        <li>Application installations, device identifiers, advertising identifiers</li>
                        <li>Push notification tokens</li>
                        <li>For Drivers: mobile sensor data (speed, direction, height, acceleration, deceleration)</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Permissions Required (Mobile App)</h3>
                    <p className="text-gray-700 mb-4">
                        Our mobile app may request access to the following Android permissions to provide you with a full-featured experience:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Location Access:</strong> ACCESS_COARSE_LOCATION and ACCESS_BACKGROUND_LOCATION for location-based services and trip recommendations</li>
                        <li><strong>Internet Access:</strong> INTERNET for app functionality and server connections</li>
                        <li><strong>Device Features:</strong> WAKE_LOCK to prevent phone sleeping during key operations; FOREGROUND_SERVICE for real-time features</li>
                        <li><strong>Contacts:</strong> READ_CONTACTS and WRITE_CONTACTS to help connect with friends and share travel plans</li>
                        <li><strong>Camera:</strong> To capture photos/videos for travel posts or profile</li>
                        <li><strong>Media Access:</strong> READ_MEDIA_IMAGES and READ_EXTERNAL_STORAGE for uploading images and videos</li>
                        <li><strong>Full-Screen Intent:</strong> USE_FULL_SCREEN_INTENT for effective notification delivery</li>
                    </ul>
                    <p className="text-sm text-gray-600 italic mb-4">
                        Note: You will be prompted for permission before any data is accessed. You may deny or revoke these permissions anytime through your device settings.
                    </p>

                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">C. Information We Collect from Third Parties</h3>
                    <p className="text-gray-700 mb-4">
                        Third-party services provide us with information needed for core aspects of the RASUTRIP Platform, including:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Background check information for drivers</li>
                        <li>Insurance, payment, transaction, and fraud detection information</li>
                        <li>Loyalty and promotional program information</li>
                        <li>Demographic and market segment information</li>
                        <li>Enterprise program information from employers</li>
                        <li>Concierge service bookings from third parties</li>
                        <li>Referral information from other users</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">How We Use Your Information</h3>
                    <p className="text-gray-700 mb-4">We use your personal information to:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Provide the RASUTRIP Platform</li>
                        <li>Maintain security and safety of the platform and users</li>
                        <li>Build and maintain the RASUTRIP community</li>
                        <li>Provide customer support</li>
                        <li>Improve the RASUTRIP Platform</li>
                        <li>Respond to legal proceedings and obligations</li>
                        <li>Personalizing content and trip suggestions</li>
                        <li>Internal record keeping</li>
                        <li>Send promotional emails only if you opt-in</li>
                        <li>Contact you about updates or offers relevant to your interests</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">How We Share Your Information</h3>
                    <p className="text-gray-700 mb-4">
                        We do not sell your personal information. To make the RASUTRIP Platform work, we may need to share your personal information with other users, third parties, and service providers.
                    </p>

                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">Sharing Between RASUTRIP Users</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Rider information shared with Driver:</strong> Pickup location, name, profile photo, rating, statistics, and destination</li>
                        <li><strong>Driver information shared with Rider:</strong> Name, profile photo, preferred pronouns, rating, real-time location, and vehicle information</li>
                        <li><strong>Shared rides:</strong> Names and profile pictures of co-riders for safety</li>
                        <li><strong>Third-party bookings:</strong> Trip details may be shared with the paying party</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Marketing & Communication</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>You can opt out of direct marketing by unchecking the relevant box in our forms</li>
                        <li>If you previously agreed to receive marketing, you may unsubscribe at any time by contacting us</li>
                        <li>We will <strong>never</strong> sell or lease your personal data to third parties without your permission unless required by law</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">External Links</h3>
                    <p className="text-gray-700 mb-4">
                        Our platform may contain links to external websites. Once you leave RASUTRIP.com, we are no longer responsible for the privacy or protection of your data on those sites. We encourage you to review their privacy policies separately.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">How We Store and Protect Your Information</h3>
                    <p className="text-gray-700 mb-4">
                        We retain your information for as long as necessary to provide you and our other users the RASUTRIP Platform. We keep your profile information for as long as you maintain an account and retain transactional information for at least seven years for legitimate business functions. We take reasonable and appropriate measures designed to protect your personal information, though no security measures can be 100% effective.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Your Rights and Choices</h3>
                    <p className="text-gray-700 mb-4">
                        RASUTRIP provides ways for you to access and delete your personal information as well as exercise other data rights:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Email Subscriptions:</strong> Unsubscribe from commercial emails anytime</li>
                        <li><strong>Text Messages:</strong> Opt out of promotional texts</li>
                        <li><strong>Push Notifications:</strong> Control through device settings</li>
                        <li><strong>Profile Information:</strong> Review and edit account information</li>
                        <li><strong>Location Information:</strong> Control through device system settings</li>
                        <li><strong>Cookie Tracking:</strong> Modify browser settings</li>
                        <li><strong>Account Deletion:</strong> Request account deletion through our privacy homepage</li>
                        <li><strong>Right to Know:</strong> See what data we've collected about you</li>
                        <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                    </ul>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Children's Data</h3>
                    <p className="text-gray-700 mb-4">
                        RASUTRIP is not directed to children, and we don't knowingly collect personal information from children under the age of 13. If we find out that a child under 13 has given us personal information, we will take steps to delete that information.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Policy Updates</h3>
                    <p className="text-gray-700 mb-4">
                        We may update this policy from time to time as the RASUTRIP Platform changes and privacy law evolves. If we update it, we will do so online, and if we make material changes, we will let you know through the RASUTRIP Platform or by email. When you use RASUTRIP, you are agreeing to the most recent terms of this policy.
                    </p>

                    <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Contact Us</h3>
                    <p className="text-gray-700 mb-4">
                        If you have any questions or concerns about this Privacy Policy, feel free to contact us directly at <strong>yourapp@rasutrip.com</strong>. If you have any questions about your privacy or anything in this policy, including if you need to access this policy in an alternative format, we encourage you to contact us.
                    </p>


                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;
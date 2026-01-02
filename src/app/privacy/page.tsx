import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-slate-800">Privacy Policy</h1>
                <p className="text-slate-500 mb-4">Last Updated: January 02, 2026</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-slate-700">1. Information We Collect</h2>
                    <p className="text-slate-600 mb-2">OfferMitra collects limited information to provide marketing services:</p>
                    <ul className="list-disc ml-6 text-slate-600 space-y-1">
                        <li>Shop details (Name, Address)</li>
                        <li>Product details for offer generation</li>
                        <li>Images uploaded for posters/videos (stored temporarily during generation)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-slate-700">2. How We Use Information</h2>
                    <p className="text-slate-600">We use your data strictly to generate AI-powered marketing content. We do not sell your shop or customer data to third parties.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-slate-700">3. Third-Party Services</h2>
                    <p className="text-slate-600 mb-2">Our app integrates with:</p>
                    <ul className="list-disc ml-6 text-slate-600 space-y-1">
                        <li>Google Gemini AI (for content generation)</li>
                        <li>Firebase (for secure authentication)</li>
                        <li>WhatsApp (via external links for sharing)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-slate-700">4. Permissions</h2>
                    <p className="text-slate-600">If using the mobile app, we may request access to your Camera or Gallery to allow you to upload shop and product photos for your posters.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-slate-700">5. Contact Us</h2>
                    <p className="text-slate-600">For any questions regarding privacy, contact us at: support@offermitra.com</p>
                </section>

                <div className="mt-12 text-center">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to App</a>
                </div>
            </div>
        </div>
    );
}

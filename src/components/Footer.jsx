import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
      { label: 'API', href: '/api' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  };

  return (
    <footer className="relative mt-20">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-2xl font-black text-gradient">
                SmartSplit
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The smartest way to split expenses with friends and family. 
              Powered by AI, secured by design, loved by thousands.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: '📧', label: 'Email', href: 'mailto:support@smartsplit.com' },
                { icon: '🐦', label: 'Twitter', href: 'https://twitter.com/smartsplit' },
                { icon: '📘', label: 'Facebook', href: 'https://facebook.com/smartsplit' },
                { icon: '📸', label: 'Instagram', href: 'https://instagram.com/smartsplit' },
                { icon: '💼', label: 'LinkedIn', href: 'https://linkedin.com/company/smartsplit' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover-scale"
                  aria-label={social.label}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="glass rounded-2xl p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with SmartSplit
            </h3>
            <p className="text-gray-300 mb-6">
              Get the latest features, tips, and updates delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 input"
              />
              <button className="btn btn-primary">
                <span>Subscribe</span>
                <span>📧</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} SmartSplit. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>🌍</span>
                <span>English (US)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>💳</span>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer;
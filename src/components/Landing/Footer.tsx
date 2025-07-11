import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div>
          <h4 className="text-black font-semibold mb-3">CATEGORIES</h4>
          <ul className="space-y-2">
            <li>User Interface</li>
            <li>User Experience</li>
            <li>Digital Media</li>
            <li>Lifestyle</li>
            <li>Programming</li>
            <li>Animation</li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-semibold mb-3">PRODUCT</h4>
          <ul className="space-y-2">
            <li>Pricing</li>
            <li>Overview</li>
            <li>Browse</li>
            <li>Accessibility</li>
            <li>Five</li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-semibold mb-3">SOLUTIONS</h4>
          <ul className="space-y-2">
            <li>Brainstorming</li>
            <li>Ideation</li>
            <li>Wireframing</li>
            <li>Research</li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-semibold mb-3">RESOURCES</h4>
          <ul className="space-y-2">
            <li>Help Center</li>
            <li>Blog</li>
            <li>Tutorials</li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-semibold mb-3">SUPPORT</h4>
          <ul className="space-y-2">
            <li>Contact Us</li>
            <li>Developers</li>
            <li>Documentation</li>
            <li>Integrations</li>
            <li>Reports</li>
            <li>Webinar</li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-semibold mb-3">COMPANY</h4>
          <ul className="space-y-2">
            <li>About</li>
            <li>Press</li>
            <li>Events</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <p className="text-gray-500 text-sm">@ 2023 Wrapp. All rights reserved</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0 text-gray-500">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0 text-gray-500 text-xl">
          <FaYoutube />
          <FaFacebookF />
          <FaTwitter />
          <FaInstagram />
          <FaLinkedinIn />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

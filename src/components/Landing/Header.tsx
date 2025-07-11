import React from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-indigo-600">NEO TEMPLATES</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
              <span className="font-medium">Generate</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
              <span className="font-medium">Business</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
              <span className="font-medium">Plans and Pricing</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
              <span className="font-medium">Learn</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Create Account
            </button>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Log in
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-1 text-gray-700 cursor-pointer">
                <span className="font-medium">Generate</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-gray-700 cursor-pointer">
                <span className="font-medium">Business</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-gray-700 cursor-pointer">
                <span className="font-medium">Plans and Pricing</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-gray-700 cursor-pointer">
                <span className="font-medium">Learn</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                <button className="text-gray-700 font-medium text-left">Create Account</button>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">
                  Log in
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
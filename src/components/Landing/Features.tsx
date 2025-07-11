import React, { useState } from "react";
import { FaBolt, FaInfinity } from 'react-icons/fa';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const Features = () => {
  const [activeTab, setActiveTab] = useState("Research");
  const tabs = ["Research", "Plan", "Design"];
  return (
    <div>
      {/* Business Growth Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get Your Business To Grow Fast
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sed ut vestibulum eget purus ornare. Risus elit et fringilla habitant ut facilisi.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="">
              <div className="relative">
                {/* Browser Window */}
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white rounded px-3 py-1 text-xs text-gray-600 flex items-center space-x-2">
                        <ChevronLeft className="w-3 h-3" />
                        <ChevronRight className="w-3 h-3" />
                        <span>website.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 "
                    style={{ minHeight: '400px' }}>
                    {/* Sidebar */}
                    <div className="flex space-x-4">
                      <div className="w-16 space-y-2">
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                        <div className="h-2 bg-blue-200 rounded"></div>
                      </div>

                      {/* Main Content Area */}
                      <div className="flex-1">
                        <div className="space-y-3">
                          <div className="h-3 bg-blue-300 rounded w-3/4"></div>
                          <div className="h-2 bg-blue-200 rounded w-full"></div>
                          <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                          <div className="h-3 bg-blue-300 rounded w-3/4"></div>
                          <div className="h-2 bg-blue-200 rounded w-full"></div>
                          <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                          <div className="h-3 bg-blue-300 rounded w-3/4"></div>
                          <div className="h-2 bg-blue-200 rounded w-full"></div>
                          <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                          <div className="h-3 bg-blue-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Modal */}
                    <div className="absolute right-8 top-20 bg-white rounded-lg shadow-xl p-4 border border-gray-200 max-w-xs">
                      <div className="grid grid-cols-6 gap-1 mb-3">
                        {Array.from({ length: 30 }, (_, i) => (
                          <div key={i} className="aspect-square bg-gradient-to-br from-orange-200 to-red-300 rounded-sm border border-orange-300"></div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-600">Wanda Gordon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-6">
                <FaBolt className="w-8 h-8 text-indigo-600 mr-3" />
                <span className="text-indigo-600 font-semibold uppercase tracking-wide">NO LIMITS</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Unlimited Ideas For Your Projects
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Feature Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Improve Workflow
            </h2>

            {/* Process Steps */}
            <div className="w-full">
              {/* Tab Buttons */}
              <div className="flex space-x-8 mb-4 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-2 text-sm font-medium transition-colors duration-200
              ${activeTab === tab
                        ? "text-purple-600"
                        : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab}

                    {/* Animated underline */}
                    {activeTab === tab && (
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-600 rounded transition-all duration-300" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-4 text-sm text-gray-700">
                {activeTab === "Research" && <div>🔍 Research content goes here.</div>}
                {activeTab === "Plan" && <div>📝 Plan content goes here.</div>}
                {activeTab === "Design" && <div>🎨 Design content goes here.</div>}
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>

            <button className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors">
              Check the tools
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Workspace Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-blue-200 p-8">
                {/* Simulated workspace */}
                <div className="bg-white rounded-lg shadow-lg p-6 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500">DESIGN SYSTEM</div>
                    <div className="flex space-x-2">
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Chart/Graph simulation */}
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2 h-24">
                      <div className="bg-blue-500 h-full w-8 rounded-t"></div>
                      <div className="bg-orange-500 h-3/4 w-8 rounded-t"></div>
                      <div className="bg-green-500 h-1/2 w-8 rounded-t"></div>
                      <div className="bg-purple-500 h-5/6 w-8 rounded-t"></div>
                      <div className="bg-pink-500 h-2/3 w-8 rounded-t"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-12 bg-gray-100 rounded"></div>
                      <div className="h-12 bg-gray-100 rounded"></div>
                      <div className="h-12 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Person silhouette overlay */}
            <div className="absolute bottom-0 right-0 w-24 h-32 bg-gradient-to-t from-gray-800 to-gray-600 rounded-tl-3xl opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
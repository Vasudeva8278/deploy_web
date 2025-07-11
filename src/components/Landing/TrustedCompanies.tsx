import React from 'react';

const TrustedCompanies = () => {
 

  return (
    <section className="py-14 px-6 bg-white border-t border-b border-gray-100 mt-10 mb-10">
      <div className="max-w-8xl mx-auto">
        <div className="grid grid-cols-9 gap-6 items-center justify-items-center">
          {/* Google */}
          <div className="text-4xl font-normal text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-yellow-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-red-500"></div>
              <div className="w-2 h-2 bg-green-500"></div>
              <div className="w-2 h-2 bg-blue-500"></div>
              <div className="w-2 h-2 bg-yellow-500"></div>
            </div>
            <span className="text-4xl font-normal">Microsoft</span>
          </div>

          {/* Airbnb */}
          <div className="text-4xl font-normal text-red-500 hover:text-red-600 transition-colors cursor-pointer">
            airbnb
          </div>

          {/* HubSpot */}
          <div className="text-4xl font-bold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer">
            HubSpot
          </div>

          {/* Walmart */}
          <div className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
            Walmart
          </div>

          {/* FedEx */}
          <div className="text-4xl font-bold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
            FedEx
          </div>

           <div className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
            Wipro
          </div>

          {/* Airbnb */}
          <div className="text-4xl font-normal text-red-500 hover:text-red-600 transition-colors cursor-pointer">
            airbnb
          </div>

          {/* HubSpot */}
          <div className="text-4xl font-bold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer">
            HubSpot
          </div>
        </div>
      </div>
    </section>

  );
};

export default TrustedCompanies;
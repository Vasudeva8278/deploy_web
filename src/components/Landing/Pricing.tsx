import React from 'react';
import { FaCheck } from 'react-icons/fa';

const Pricing = () => {
  const [isYearly, setIsYearly] = React.useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'For one person',
      price: 0,
      yearlyPrice: 0,
      features: [
        'For designing or working on anything.',
        'Basic templates',
        'Standard support'
      ],
      buttonText: 'Get started',
      buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
      popular: false,
      accent: 'border-black-500'
    },
    {
      name: 'Starter',
      description: 'For one person',
      price: 8,
      yearlyPrice: 6,
      features: [
        'For growing your brand or passion project with premium features.',
        'Premium templates',
        'Priority support',
        'Advanced features'
      ],
      buttonText: 'Get started',
      buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
      popular: false,
      accent: 'border-yellow-500'
    },
    {
      name: 'Business',
      description: 'For your team',
      price: 16,
      yearlyPrice: 12,
      features: [
        'For teams to create together with premium workplace tools and workflows.',
        'Team collaboration',
        'Unlimited projects',
        'Advanced analytics'
      ],
      buttonText: 'Get started',
      buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
      popular: true,
      accent: 'border-green-500'
    },
    {
      name: 'Enterprise',
      description: 'For your organisation',
      price: 'Custom',
      yearlyPrice: 'Custom',
      features: [
        'For organisations to unite and manage their teams, brands, and designs.',
        'Custom integrations',
        'Dedicated support',
        'Enterprise security'
      ],
      buttonText: 'Get started',
      buttonStyle: 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50',
      popular: false,
      accent: 'border-indigo-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            An Ideal Fit For Everyone
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your business needs
          </p>
          
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-200 p-1 rounded-lg flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  !isYearly 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  isYearly 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative ${
                plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
              } ${plan.accent ? `border-t-4  ${plan.accent}` : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        ${isYearly ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start mb-3">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
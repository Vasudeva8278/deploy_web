import React from 'react';
import Hero from '../components/Landing/Hero.tsx';
import TrustedCompanies from '../components/Landing/TrustedCompanies.tsx';
import Pricing from '../components/Landing/Pricing.tsx';
import Explore from '../components/Landing/Explore.tsx';
import Features from '../components/Landing/Features.tsx';
import Footer from '../components/Landing/Footer.tsx';
import Collection from '../components/Landing/Collection.tsx';
// import Colletion from '../components/Landing/Collection.tsx'; // File deleted
// import Explore from '../components/Landing/Explore.tsx'; // File may not exist

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <TrustedCompanies />
      <Pricing />
      <Features />
      <Explore />
      <Collection />
      {/* <Explore /> */}
      {/* <Colletion /> */}
      <Footer />
    </div>
  );
}

export default LandingPage;
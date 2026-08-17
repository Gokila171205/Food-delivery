import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import LocationModal from '../components/LocationModal';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <LocationModal />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;

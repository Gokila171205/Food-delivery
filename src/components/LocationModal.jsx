import React from 'react';
import { FiX, FiSearch, FiCrosshair, FiMapPin } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { recentLocations } from '../data/mockData';

const LocationModal = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, setLocation } = useAppContext();

  if (!isLocationModalOpen) return null;

  const handleSelect = (loc) => {
    setLocation(loc);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsLocationModalOpen(false)}
      ></div>
      
      {/* Modal Content - Slides in from right */}
      <div className="relative w-full md:w-[400px] h-full bg-white shadow-2xl p-6 flex flex-col animate-[slideIn_0.3s_ease-out]">
        <button 
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FiX className="text-2xl" />
        </button>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Choose your location</h2>
          
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search for area, street or restaurant" 
              className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              autoFocus
            />
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-lg" />
          </div>

          <div 
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-orange-50 transition-colors mb-8 group"
            onClick={() => handleSelect("Current Location")}
          >
            <FiCrosshair className="text-primary text-xl group-hover:animate-spin-slow" />
            <div>
              <p className="font-semibold text-primary">Use current location</p>
              <p className="text-xs text-gray-500">Using GPS</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent locations</h3>
            <ul className="space-y-4">
              {recentLocations.map((loc, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => handleSelect(loc)}
                >
                  <FiMapPin className="text-gray-400 mt-1 group-hover:text-primary transition-colors" />
                  <div className="border-b border-gray-100 pb-4 w-full group-hover:border-primary/30 transition-colors">
                    <p className="font-medium text-gray-700 group-hover:text-primary transition-colors">{loc.split(',')[0]}</p>
                    <p className="text-sm text-gray-500">{loc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default LocationModal;

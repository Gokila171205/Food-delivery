import React from 'react';
import { offers } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { FiCopy, FiTag } from 'react-icons/fi';

const Offers = () => {
  const { showToast } = useAppContext();

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon ${code} copied!`);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Best offers for you</h2>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className={`flex-shrink-0 w-80 md:w-96 rounded-2xl p-6 text-white shadow-lg ${offer.bg} relative overflow-hidden group`}
            >
              {/* Decor */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FiTag className="text-xl" />
                    <span className="font-semibold text-sm uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Deal</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{offer.title}</h3>
                </div>
                
                <div className="flex items-center justify-between mt-6 bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="font-mono font-bold tracking-widest">{offer.code}</span>
                  <button 
                    onClick={() => handleCopyCode(offer.code)}
                    className="flex items-center gap-1 bg-white text-gray-900 px-3 py-1.5 rounded text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <FiCopy /> Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;

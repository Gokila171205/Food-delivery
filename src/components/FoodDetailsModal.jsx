import React, { useState } from 'react';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const FoodDetailsModal = ({ dish, isOpen, onClose, restaurantId }) => {
  const { addToCart } = useAppContext();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSpice, setSelectedSpice] = useState(
    dish.customizations?.spiceLevels ? dish.customizations.spiceLevels[0] : null
  );
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  if (!isOpen) return null;

  const handleAddOnToggle = (addon) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addon.name);
      if (exists) return prev.filter(a => a.name !== addon.name);
      return [...prev, addon];
    });
  };

  const calculateTotal = () => {
    const addonsTotal = selectedAddOns.reduce((total, a) => total + a.price, 0);
    return (dish.price + addonsTotal) * quantity;
  };

  const handleAddToCart = () => {
    const customizations = {
      spiceLevel: selectedSpice,
      addOns: selectedAddOns
    };
    const basePrice = dish.price + selectedAddOns.reduce((total, a) => total + a.price, 0);
    addToCart(dish, restaurantId, quantity, customizations, basePrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full md:w-[500px] max-h-[90vh] md:max-h-[85vh] md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-gray-100"
        >
          <FiX className="text-xl" />
        </button>

        <div className="h-48 md:h-64 w-full flex-shrink-0 relative">
          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover md:rounded-t-2xl rounded-t-3xl" />
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm ${dish.isVeg ? 'border-green-600' : 'border-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{dish.name}</h2>
          </div>
          
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="font-bold text-gray-800">₹{dish.price}</span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-500 font-bold">⭐ {dish.rating}</span>
          </div>

          <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">
            {dish.description}
          </p>

          {/* Customizations */}
          {dish.customizations && (
            <div className="space-y-6">
              
              {dish.customizations.spiceLevels && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Spice Level</h3>
                  <div className="flex flex-wrap gap-3">
                    {dish.customizations.spiceLevels.map(level => (
                      <label 
                        key={level} 
                        className={`px-4 py-2 rounded-xl border cursor-pointer text-sm font-semibold transition-colors
                          ${selectedSpice === level ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name="spice" 
                          className="hidden" 
                          checked={selectedSpice === level}
                          onChange={() => setSelectedSpice(level)}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {dish.customizations.addOns && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Add-ons</h3>
                  <div className="space-y-3">
                    {dish.customizations.addOns.map(addon => {
                      const isSelected = selectedAddOns.find(a => a.name === addon.name);
                      return (
                        <label key={addon.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={!!isSelected}
                              onChange={() => handleAddOnToggle(addon)}
                              className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                            <span className="font-semibold text-gray-700">{addon.name}</span>
                          </div>
                          <span className="font-bold text-gray-500">+₹{addon.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-4 sticky bottom-0 rounded-b-2xl">
          <div className="flex items-center gap-4 bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-gray-500 hover:text-primary transition-colors text-lg"
            >
              <FiMinus />
            </button>
            <span className="font-bold w-6 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="text-gray-500 hover:text-primary transition-colors text-lg"
            >
              <FiPlus />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors shadow-md flex items-center justify-between"
          >
            <span>Add to Cart</span>
            <span>₹{calculateTotal()}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FoodDetailsModal;

import React, { useState } from 'react';
import { FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import FoodDetailsModal from './FoodDetailsModal';

const DishCard = ({ dish }) => {
  const { cart, addToCart, updateCartItemQuantity, removeCartItem } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if item is in cart with default customizations
  const cartItems = cart.filter(item => item.id === dish.id);
  // For simplicity on the card, we just show total quantity of this dish, 
  // but if they have different customizations, it's better to manage via modal.
  // We will find the first cart item of this dish without customizations for the quick add/remove.
  const defaultCartItem = cartItems.find(item => !item.selectedCustomizations || (item.selectedCustomizations.addOns?.length === 0 && !item.selectedCustomizations.spiceLevel));

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (dish.customizations) {
      setIsModalOpen(true);
    } else {
      addToCart(dish, dish.restaurantId, 1, null, dish.price);
    }
  };

  const handleUpdateQuantity = (e, delta) => {
    e.stopPropagation();
    if (defaultCartItem) {
      const identifier = defaultCartItem.cartItemId || defaultCartItem._id || defaultCartItem.foodId;
      if (defaultCartItem.quantity + delta === 0) {
        removeCartItem(identifier);
      } else {
        updateCartItemQuantity(identifier, delta);
      }
    }
  };

  return (
    <>
      <div 
        className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${dish.isVeg ? 'border-green-600' : 'border-red-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
            {dish.customizations && <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-0.5 rounded text-yellow-600">Customizable</span>}
          </div>
          
          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{dish.name}</h3>
          
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-bold text-gray-800">₹{dish.price}</span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-500 font-bold flex items-center gap-1"><FiStar className="fill-current" /> {dish.rating}</span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 pr-4">{dish.description}</p>
        </div>
        
        <div className="relative w-32 h-32 flex-shrink-0">
          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
          
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24">
            {defaultCartItem ? (
              <div className="bg-white border-2 border-primary text-primary font-bold rounded-lg shadow-md flex items-center justify-between px-2 py-1.5 w-full">
                <button 
                  onClick={(e) => handleUpdateQuantity(e, -1)}
                  className="p-1 hover:bg-orange-50 rounded"
                >
                  <FiMinus />
                </button>
                <span>{defaultCartItem.quantity}</span>
                <button 
                  onClick={(e) => handleUpdateQuantity(e, 1)}
                  className="p-1 hover:bg-orange-50 rounded"
                >
                  <FiPlus />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleQuickAdd}
                className="w-full bg-white border border-gray-200 text-green-600 font-extrabold py-2 px-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors uppercase text-sm"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      <FoodDetailsModal 
        dish={dish}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={dish.restaurantId}
      />
    </>
  );
};

export default DishCard;

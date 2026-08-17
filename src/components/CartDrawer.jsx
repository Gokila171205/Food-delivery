import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateCartItemQuantity, isCartDrawerOpen, setIsCartDrawerOpen } = useAppContext();

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => setIsCartDrawerOpen(false)}
      ></div>
      
      <div className="relative bg-white w-full md:w-[400px] h-full shadow-2xl flex flex-col animate-[slideLeft_0.3s_ease-out]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <FiShoppingBag /> Your Cart
          </h2>
          <button 
            onClick={() => setIsCartDrawerOpen(false)} 
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4 opacity-50">🛒</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cart is empty</h3>
            <p className="text-gray-500 text-sm">Add some delicious items from the menu to see them here.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.filter(item => item).map(item => (
                <div key={item.cartItemId || item._id || item.foodId} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 border flex items-center justify-center rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name || 'Unknown Item'}</h4>
                      </div>
                      
                      {item.selectedCustomizations && (
                        <div className="text-[11px] text-gray-500 pl-4">
                          {item.selectedCustomizations.spiceLevel && <span>{item.selectedCustomizations.spiceLevel} </span>}
                          {Array.isArray(item.selectedCustomizations.addOns) && item.selectedCustomizations.addOns.length > 0 && (
                            <span> | + {item.selectedCustomizations.addOns.map(a => a?.name).filter(Boolean).join(', ')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pl-4">
                    <div className="bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-between px-2 py-1 w-20 text-sm">
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartItemId || item._id || item.foodId, -1)}
                        className="hover:text-primary transition-colors"
                      >
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartItemId || item._id || item.foodId, 1)}
                        className="hover:text-primary transition-colors"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-600">Subtotal</span>
                <span className="font-extrabold text-gray-900 text-lg">₹{cartTotal}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Extra charges may apply</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleCheckout}
                  className="flex-1 bg-white border border-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
                >
                  View Cart
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-md transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          @keyframes slideLeft {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;

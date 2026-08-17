import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { offers } from '../data/mockData';
import { getRestaurantById } from '../services/restaurantService';
import { FiMinus, FiPlus, FiArrowLeft, FiTag, FiCheck, FiX } from 'react-icons/fi';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    cartTotal, 
    cartRestaurantId, 
    updateCartItemQuantity, 
    removeCartItem, 
    clearCart,
    showToast,
    user 
  } = useAppContext();
  
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  
  const [restaurant, setRestaurant] = useState(null);

  const safeCart = Array.isArray(cart) 
    ? cart.filter(item => item && (item.foodId || item._id || item.id) && item.restaurantId)
    : [];

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (cartRestaurantId) {
        try {
          const res = await getRestaurantById(cartRestaurantId);
          setRestaurant(res.restaurant);
        } catch (err) {
          console.error("Failed to fetch cart restaurant details", err);
        }
      } else {
        setRestaurant(null);
      }
    };
    fetchRestaurant();
  }, [cartRestaurantId]);

  // Bill calculations
  const itemTotal = Number(cartTotal) || 0;
  const deliveryFee = itemTotal > 0 ? 30 : 0;
  const taxes = itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0; // 5% tax

  let discount = 0;
  if (appliedCoupon && itemTotal > 0) {
    if (appliedCoupon.code === 'WELCOME50') {
      discount = Math.min(itemTotal * 0.5, 100);
    } else if (appliedCoupon.code === 'PARTY125' && itemTotal > 399) {
      discount = 125;
    } else if (appliedCoupon.code === 'FREEDEL') {
      discount = deliveryFee;
    } else if (appliedCoupon.code === 'YUMMY20') {
      discount = itemTotal * 0.2;
    }
  }

  const totalPayable = itemTotal + deliveryFee + taxes - discount;

  const handleApplyCoupon = (coupon) => {
    if (coupon.code === 'PARTY125' && itemTotal <= 399) {
      alert("Minimum order amount for this coupon is ₹400");
      return;
    }
    setAppliedCoupon(coupon);
    setIsCouponModalOpen(false);
  };

  const handleApplyInputCoupon = (e) => {
    e.preventDefault();
    const found = offers.find(o => o.code.toUpperCase() === couponInput.toUpperCase());
    if (found) {
      handleApplyCoupon(found);
    } else {
      alert("Invalid coupon code");
    }
  };

  console.log("=== CART DEBUG ===");
  console.log("cart:", cart);
  console.log("safeCart:", safeCart);
  console.log("cart type:", typeof cart);
  console.log("cart array:", Array.isArray(cart));
  console.log("restaurant:", restaurant);
  console.log("itemTotal:", itemTotal, "deliveryFee:", deliveryFee, "taxes:", taxes, "discount:", discount);
  
  if (safeCart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Discover delicious food near you.</p>
        <button 
          onClick={() => navigate('/restaurants')}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-gray-100">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
              {restaurant && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <img src={restaurant.image} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">{restaurant.name}</h2>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(', ') : restaurant.cuisines}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {safeCart.map(item => {
                  const price = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemKey = item.cartItemId || item._id || item.foodId || Math.random().toString();
                  
                  return (
                    <div key={itemKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </div>
                          <h3 className="font-bold text-gray-900">{item.name || 'Unknown Item'}</h3>
                        </div>
                        
                        {item.selectedCustomizations && (
                          <div className="text-xs text-gray-500 pl-5">
                            {item.selectedCustomizations.spiceLevel && <span>{item.selectedCustomizations.spiceLevel} </span>}
                            {Array.isArray(item.selectedCustomizations.addOns) && item.selectedCustomizations.addOns.length > 0 && (
                              <span> | + {item.selectedCustomizations.addOns.map(a => a?.name).filter(Boolean).join(', ')}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 self-start sm:self-auto pl-5 sm:pl-0">
                        <div className="bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-between px-2 py-1 w-24">
                          <button 
                            onClick={() => updateCartItemQuantity(item.cartItemId || item._id || item.foodId, -1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <FiMinus />
                          </button>
                          <span>{quantity}</span>
                          <button 
                            onClick={() => updateCartItemQuantity(item.cartItemId || item._id || item.foodId, 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900 w-16 text-right">₹{price * quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bill Details Section */}
          <div className="w-full lg:w-96 flex-shrink-0">
            {/* Coupon Block */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsCouponModalOpen(true)}>
              {appliedCoupon ? (
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <FiCheck className="text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Coupon {appliedCoupon.code} applied</p>
                      <p className="text-sm font-bold text-green-600">You saved ₹{Math.round(discount)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setAppliedCoupon(null); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-primary rounded-full flex items-center justify-center">
                      <FiTag className="text-xl" />
                    </div>
                    <span className="font-bold text-gray-900">Apply Coupon</span>
                  </div>
                  <span className="text-gray-400">&gt;</span>
                </div>
              )}
            </div>

            {/* Bill Block */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 mb-6 text-lg">Bill Details</h3>
              
              <div className="space-y-4 mb-6 text-sm text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{itemTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes and Charges</span>
                  <span>₹{taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}
              </div>

              <hr className="border-dashed border-gray-200 mb-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="font-extrabold text-gray-900 text-lg">Total Payable</span>
                <span className="font-extrabold text-gray-900 text-xl">₹{Math.round(totalPayable)}</span>
              </div>

              <button 
                onClick={() => {
                  if (user) {
                    navigate('/checkout');
                  } else {
                    showToast('Please login to continue to checkout.');
                    navigate('/login', { state: { from: { pathname: '/checkout' } } });
                  }
                }}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)}></div>
          <div className="relative bg-white w-full md:w-[400px] max-h-[90vh] md:max-h-[85vh] md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">Apply Coupon</h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleApplyInputCoupon} className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium uppercase outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button type="submit" className="bg-gray-900 text-white font-bold px-6 rounded-xl hover:bg-gray-800">Apply</button>
              </form>

              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Available Coupons</h3>
              <div className="space-y-4">
                {offers.map(offer => (
                  <div key={offer.id} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-orange-50 text-primary font-extrabold px-3 py-1 rounded-lg border border-orange-100">
                        {offer.code}
                      </div>
                      <button 
                        onClick={() => handleApplyCoupon(offer)}
                        className="text-primary font-bold hover:underline"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{offer.title}</p>
                    <p className="text-xs text-gray-500">Valid on orders above ₹399</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

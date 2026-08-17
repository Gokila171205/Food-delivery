import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { offers } from '../data/mockData';
import AddressModal from '../components/AddressModal';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiCheckCircle, FiTrash2, FiEdit2, FiTag } from 'react-icons/fi';
import { validateCoupon } from '../services/couponService';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, cartRestaurantId, addresses, deleteAddress, setDefaultAddress, placeOrder, showToast } = useAppContext();
  
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const [deliveryInstructions, setDeliveryInstructions] = useState({
    leaveAtDoor: false,
    avoidCalling: false,
    deliverToSecurity: false
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [verifiedBill, setVerifiedBill] = useState(null);

  const [validationError, setValidationError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById('razorpay-checkout-js')) return;
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    };
    loadScript();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Add some delicious food first!");
      navigate('/restaurants');
    }
  }, [cart, navigate, showToast]);

  // Set default address if it changes and none selected
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id || defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  if (cart.length === 0) return null; // Prevent render flash before redirect

  const [mockRestaurant, setMockRestaurant] = useState(null);

  useEffect(() => {
    if (cartRestaurantId) {
      import('../services/restaurantService').then(({ getRestaurantById }) => {
        getRestaurantById(cartRestaurantId).then(res => setMockRestaurant(res.restaurant)).catch(console.error);
      });
    }
  }, [cartRestaurantId]);

  const displayRestaurantName = mockRestaurant?.name || "Restaurant";
  const displayRestaurantTime = mockRestaurant?.time || "30-40 min";
  const displayRestaurantDistance = mockRestaurant?.distance || "2.5 km";

  // Bill calculations fallback
  const itemTotal = cartTotal;
  const deliveryFee = verifiedBill ? verifiedBill.deliveryFee : (itemTotal > 0 ? 30 : 0);
  const taxes = verifiedBill ? verifiedBill.tax : (itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0);
  const discount = verifiedBill ? verifiedBill.discount : 0; 
  const totalPayable = verifiedBill ? verifiedBill.total : (itemTotal + deliveryFee + taxes - discount);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) {
      setCouponError("Enter a coupon code");
      return;
    }
    try {
      const res = await validateCoupon(couponCode, cart);
      setAppliedCoupon(res.data.data.coupon);
      setVerifiedBill(res.data.data.bill);
      showToast("Coupon applied successfully!");
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
      setVerifiedBill(null);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setVerifiedBill(null);
    setCouponError('');
  };

  const handleVerifyUpi = () => {
    if (upiId.includes('@')) {
      setIsUpiVerified(true);
      setValidationError('');
    } else {
      setIsUpiVerified(false);
      setValidationError('Please enter a valid UPI ID (e.g., name@bank)');
    }
  };

  const validateCheckout = () => {
    if (!selectedAddressId) return "Please select a delivery address.";
    const selectedAddress = addresses.find(a => (a.id || a._id) === selectedAddressId);
    if (!selectedAddress) return "Delivery address not found. Please select an address.";
    
    if (!paymentMethod) return "Please select a payment method.";
    
    if (paymentMethod === 'UPI' && !isUpiVerified) return "Please verify your UPI ID.";
    
    if (paymentMethod === 'Card') {
      if (cardData.number.length < 16) return "Please enter a valid 16-digit card number.";
      if (!cardData.name) return "Please enter the cardholder name.";
      if (!cardData.expiry) return "Please enter the expiry date.";
      if (cardData.cvv.length < 3) return "Please enter a valid CVV.";
    }

    return "";
  };

  const handlePlaceOrder = async () => {
    const error = validateCheckout();
    if (error) {
      setValidationError(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedAddress = addresses.find(a => (a.id || a._id) === selectedAddressId);
    
    const formattedItems = cart.map(item => ({
      food: item.foodId || item._id || item.id,
      quantity: item.quantity,
      customizations: item.selectedCustomizations || {}
    }));

    const instrArr = [];
    if (deliveryInstructions.leaveAtDoor) instrArr.push('Leave at door');
    if (deliveryInstructions.avoidCalling) instrArr.push('Avoid calling');
    if (deliveryInstructions.deliverToSecurity) instrArr.push('Deliver to security');

    const orderData = {
      restaurant: cartRestaurantId,
      items: formattedItems,
      addressId: selectedAddressId,
      paymentMethod: paymentMethod === 'Card' ? 'Razorpay' : paymentMethod,
      deliveryInstructions: instrArr.join(', '),
      couponCode: appliedCoupon ? appliedCoupon.code : undefined
    };

    setIsProcessingPayment(true);

    try {
      if (paymentMethod === 'Card') {
        // Razorpay flow
        const { data: payData } = await createPaymentOrder(orderData);
        
        const options = {
          key: payData.data.razorpayKeyId,
          amount: payData.data.amount,
          currency: payData.data.currency,
          name: "FoodRush",
          description: "Food Delivery Order",
          order_id: payData.data.razorpayOrderId,
          handler: async function (response) {
            try {
              await verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              // Fetch order to update local state if necessary or just redirect
              // Since Context's orders might not update automatically for Razorpay orders yet,
              // we can just redirect and let the next page fetch it.
              navigate('/order-success');
            } catch (verErr) {
              setValidationError("Payment verification failed. Please check your orders page.");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: selectedAddress?.name,
            contact: selectedAddress?.phone || '9999999999'
          },
          theme: { color: "#F97316" } // matches bg-primary
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          setIsProcessingPayment(false);
          setValidationError(`Payment failed: ${response.error.description}. Your order has not been marked as paid.`);
        });
        rzp1.open();

      } else {
        // COD flow
        await placeOrder(orderData);
        setIsProcessingPayment(false);
        navigate('/order-success');
      }
    } catch (err) {
      setIsProcessingPayment(false);
      setValidationError(err.response?.data?.message || 'Failed to place order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openAddAddress = () => {
    setEditAddressData(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (e, addr) => {
    e.stopPropagation();
    setEditAddressData(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this saved address?')) {
      deleteAddress(id);
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/cart')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>

        {validationError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <p className="text-red-700 font-bold">{validationError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            
            {/* Address Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <FiMapPin className="text-primary" /> Delivery Address
              </h2>
              
              <div className="space-y-4 mb-6">
                {addresses.map(addr => (
                  <div 
                    key={addr.id || addr._id}
                    onClick={() => setSelectedAddressId(addr.id || addr._id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === (addr.id || addr._id) ? 'border-primary bg-orange-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <input type="radio" checked={selectedAddressId === (addr.id || addr._id)} readOnly className="accent-primary w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'} {addr.type}</span>
                          {addr.isDefault && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><FiCheckCircle /> Default</span>}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mb-0.5">{addr.name}</p>
                        <p className="text-gray-500 text-sm leading-relaxed mb-2">
                          {addr.house}, {addr.street}<br/>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        
                        <div className="flex gap-4 text-sm font-bold mt-2">
                          <button onClick={(e) => openEditAddress(e, addr)} className="text-primary flex items-center gap-1 hover:underline"><FiEdit2 /> Edit</button>
                          <button onClick={(e) => handleDeleteAddress(e, addr.id || addr._id)} className="text-red-500 flex items-center gap-1 hover:underline"><FiTrash2 /> Delete</button>
                          {!addr.isDefault && (
                            <button onClick={(e) => { e.stopPropagation(); setDefaultAddress(addr.id || addr._id); }} className="text-gray-500 hover:text-gray-900 flex items-center gap-1">Set Default</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={openAddAddress}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                + Add New Address
              </button>
            </div>

            {/* Delivery Instructions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">Delivery Instructions <span className="text-sm font-normal text-gray-400">(Optional)</span></h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={deliveryInstructions.leaveAtDoor} onChange={(e) => setDeliveryInstructions(p => ({...p, leaveAtDoor: e.target.checked}))} className="accent-primary w-5 h-5" />
                  <span className="font-semibold text-gray-700">Leave at door</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={deliveryInstructions.avoidCalling} onChange={(e) => setDeliveryInstructions(p => ({...p, avoidCalling: e.target.checked}))} className="accent-primary w-5 h-5" />
                  <span className="font-semibold text-gray-700">Avoid calling</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={deliveryInstructions.deliverToSecurity} onChange={(e) => setDeliveryInstructions(p => ({...p, deliverToSecurity: e.target.checked}))} className="accent-primary w-5 h-5" />
                  <span className="font-semibold text-gray-700">Deliver to security</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>

              <div className="space-y-4">
                
                {/* UPI */}
                <div className={`border rounded-2xl overflow-hidden transition-colors ${paymentMethod === 'UPI' ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
                  <label className="flex items-center gap-3 p-4 cursor-pointer bg-white">
                    <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="accent-primary w-5 h-5" />
                    <div>
                      <span className="font-bold text-gray-900 block">UPI</span>
                      <span className="text-xs text-gray-500">Pay instantly using UPI</span>
                    </div>
                  </label>
                  {paymentMethod === 'UPI' && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={upiId}
                          onChange={(e) => { setUpiId(e.target.value); setIsUpiVerified(false); }}
                          placeholder="example@upi" 
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button onClick={handleVerifyUpi} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800">Verify</button>
                      </div>
                      {isUpiVerified && <p className="text-green-600 text-sm font-bold mt-2 flex items-center gap-1"><FiCheckCircle /> UPI ID verified</p>}
                    </div>
                  )}
                </div>

                {/* Razorpay Card / Netbanking / Wallets */}
                <div className={`border rounded-2xl overflow-hidden transition-colors ${paymentMethod === 'Card' ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
                  <label className="flex items-center gap-3 p-4 cursor-pointer bg-white">
                    <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="accent-primary w-5 h-5" />
                    <div>
                      <span className="font-bold text-gray-900 block">Razorpay (Cards / Netbanking / UPI)</span>
                      <span className="text-xs text-gray-500">Secure payments by Razorpay</span>
                    </div>
                  </label>
                  {paymentMethod === 'Card' && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                      <p className="text-sm font-semibold text-gray-700">You will be redirected to Razorpay securely to complete your payment.</p>
                    </div>
                  )}
                </div>

                {/* COD */}
                <div className={`border rounded-2xl overflow-hidden transition-colors ${paymentMethod === 'COD' ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
                  <label className="flex items-center gap-3 p-4 cursor-pointer bg-white">
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-primary w-5 h-5" />
                    <div>
                      <span className="font-bold text-gray-900 block">Cash on Delivery</span>
                      <span className="text-xs text-gray-500">Pay when your order arrives</span>
                    </div>
                  </label>
                  {paymentMethod === 'COD' && (
                    <div className="p-4 bg-orange-50 border-t border-orange-100 text-orange-800 text-sm font-semibold rounded-b-2xl">
                      💵 Pay ₹{Math.round(totalPayable)} in cash when your order is delivered.
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="mb-6 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-2xl">🍴</div>
                <div>
                  <p className="font-bold text-gray-900">{displayRestaurantName}</p>
                  <p className="text-xs text-gray-500">{displayRestaurantTime} • {displayRestaurantDistance}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.filter(item => item).map(item => (
                  <div key={item.cartItemId || item._id || item.foodId} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 w-3.5 h-3.5 border-2 flex-shrink-0 flex items-center justify-center rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{item.name || 'Unknown Item'}</h4>
                          {item.selectedCustomizations && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {item.selectedCustomizations.spiceLevel} 
                              {Array.isArray(item.selectedCustomizations.addOns) && item.selectedCustomizations.addOns.length > 0 && 
                                ` • +${item.selectedCustomizations.addOns.map(a => a?.name).filter(Boolean).length} add-ons`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-600 mt-1">× {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="border-dashed border-gray-200 mb-4" />

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 uppercase rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800">Apply</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-200">
                    <div>
                      <span className="font-bold text-green-700 flex items-center gap-1"><FiTag /> {appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">Coupon applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 font-bold text-sm hover:underline">Remove</button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
              </div>
              
              <div className="space-y-3 mb-6 text-sm text-gray-600 font-medium">
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
                    <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}
              </div>

              <hr className="border-dashed border-gray-200 mb-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="font-extrabold text-gray-900 text-lg">Total Payable</span>
                <span className="font-extrabold text-primary text-2xl">₹{Math.round(totalPayable)}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment}
                className={`w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg ${isProcessingPayment ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessingPayment ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        editData={editAddressData}
      />
    </div>
  );
};

export default CheckoutPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiArrowLeft, FiCheckCircle, FiClock, FiXCircle, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { verifyPayment } from '../services/paymentService';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('foodrush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cancelOrder: contextCancel, addToCart, clearCart, showToast } = useAppContext();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{error || 'Order not found'}</h2>
        <button onClick={() => navigate('/orders')} className="text-primary font-bold hover:underline">Go to My Orders</button>
      </div>
    );
  }

  const isCancellable = ['placed', 'confirmed'].includes(order.status.toLowerCase());

  const handleCancel = async () => {
    try {
      await api.put(`/orders/${order.orderId}/cancel`);
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      contextCancel(order.orderId); // Sync with context if needed
      setShowCancelConfirm(false);
      showToast('Order cancelled successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order.');
      setShowCancelConfirm(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!order.razorpayOrderId) {
      showToast("Cannot retry this payment directly. Please place a new order.");
      return;
    }
    
    setIsRetryingPayment(true);
    try {
      const options = {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_12345', // Use a generic if env is missing in frontend since backend verify does the real work
        amount: Math.round(order.bill.total * 100),
        currency: "INR",
        name: "FoodRush",
        description: "Order Retry",
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            showToast("Payment successful!");
            setOrder(prev => ({ ...prev, paymentStatus: 'paid' }));
          } catch (verErr) {
            showToast("Payment verification failed.");
          } finally {
            setIsRetryingPayment(false);
          }
        },
        prefill: {
          name: order.addressSnapshot?.name,
          contact: order.addressSnapshot?.phone || '9999999999'
        },
        theme: { color: "#F97316" }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setIsRetryingPayment(false);
        showToast(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (err) {
      setIsRetryingPayment(false);
      showToast("Failed to initiate payment");
    }
  };

  const handleReorder = async () => {
    try {
      const res = await api.post(`/orders/${order.orderId}/reorder`);
      const { items, restaurantId } = res.data;
      
      clearCart();
      
      if (items.length === 0) {
        showToast('None of the items are available anymore.');
        return;
      }
      
      items.forEach(item => {
        addToCart(
          { _id: item.foodId, name: item.name, image: item.image, price: item.price }, 
          restaurantId, 
          item.quantity, 
          item.customizations, 
          item.price
        );
      });
      
      if (items.length < order.items.length) {
        showToast('Some items are no longer available and were skipped.');
      } else {
        showToast('Items added to your cart.');
      }
      
      navigate('/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reorder.');
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/orders')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-gray-100">
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.id}</h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{order.restaurantSnapshot?.name || order.restaurantName}</h2>
          <p className="text-sm text-gray-500 mb-6">Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>

          <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Order Status</h3>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 space-y-3 font-semibold text-sm">
            {order.status.toLowerCase() === 'cancelled' ? (
              <div className="flex items-center gap-3 text-red-600">
                <FiXCircle className="text-xl" /> Order Cancelled
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-green-600">
                  <FiCheckCircle className="text-xl" /> Order Placed
                </div>
                <div className={`flex items-center gap-3 ${['confirmed', 'preparing', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? 'text-green-600' : 'text-gray-400'}`}>
                  {['confirmed', 'preparing', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? <FiCheckCircle className="text-xl" /> : <FiClock className="text-xl" />} 
                  Restaurant Confirmed
                </div>
                <div className={`flex items-center gap-3 ${['preparing', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? 'text-green-600' : 'text-gray-400'}`}>
                  {['preparing', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? <FiCheckCircle className="text-xl" /> : <FiClock className="text-xl" />} 
                  Preparing
                </div>
                <div className={`flex items-center gap-3 ${['out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? 'text-green-600' : 'text-gray-400'}`}>
                  {['out for delivery', 'delivered'].includes(order.status.toLowerCase()) ? <FiCheckCircle className="text-xl" /> : <FiClock className="text-xl" />} 
                  Out for Delivery
                </div>
                <div className={`flex items-center gap-3 ${order.status.toLowerCase() === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                  {order.status.toLowerCase() === 'delivered' ? <FiCheckCircle className="text-xl" /> : <FiClock className="text-xl" />} 
                  Delivered
                </div>
              </>
            )}
          </div>

          <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Items</h3>
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={item.cartItemId || item._id || item.foodId || index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {item.name} <span className="text-gray-500 font-semibold ml-1">× {item.quantity}</span>
                  </p>
                  {item.selectedCustomizations && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.selectedCustomizations.spiceLevel} 
                      {item.selectedCustomizations.addOns?.length > 0 && ` • +${item.selectedCustomizations.addOns.map(a=>a.name).join(', ')}`}
                    </p>
                  )}
                </div>
                <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Delivery Address</h3>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 text-sm">
            <p className="font-bold text-gray-900 mb-1">{order.addressSnapshot?.name || order.address?.name}</p>
            <p className="text-gray-500 leading-relaxed">
              {order.addressSnapshot?.addressLine || (order.address?.house + ', ' + order.address?.street)}<br/>
              {order.addressSnapshot?.city || order.address?.city}, {order.addressSnapshot?.state || order.address?.state} - {order.addressSnapshot?.pincode || order.address?.pincode}
            </p>
          </div>

          <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Payment & Bill Details</h3>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-bold text-gray-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                {order.paymentStatus === 'paid' ? 'PAID' : (order.paymentStatus === 'pending' ? 'PENDING' : order.paymentStatus?.toUpperCase())}
              </span>
            </div>
            <hr className="border-dashed border-gray-200 my-3" />
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{order.bill?.itemTotal || order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{order.bill?.deliveryFee || order.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>₹{order.bill?.tax || order.tax}</span>
              </div>
              {(order.bill?.discount > 0 || order.discount > 0) && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{Math.round(order.bill?.discount || order.discount)}</span>
                </div>
              )}
            </div>
            <hr className="border-dashed border-gray-200 my-3" />
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-gray-900 text-base">Total Paid</span>
              <span className="font-extrabold text-gray-900 text-lg">₹{Math.round(order.bill?.total || order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleReorder}
            className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw /> Reorder
          </button>
          
          {(order.paymentStatus === 'failed' || (order.paymentStatus === 'pending' && order.paymentMethod === 'Razorpay')) && (
            <button 
              onClick={handleRetryPayment}
              disabled={isRetryingPayment}
              className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <FiAlertCircle /> {isRetryingPayment ? 'Processing...' : 'Retry Payment'}
            </button>
          )}

          {isCancellable && (
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 bg-white border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-[slideUp_0.2s_ease-out]">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Cancel Order?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Keep Order
              </button>
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-md transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;

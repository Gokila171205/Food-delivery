import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiCheckCircle, FiClock, FiMapPin, FiShoppingBag, FiTruck } from 'react-icons/fi';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { latestOrder, showToast } = useAppContext();

  useEffect(() => {
    if (!latestOrder) {
      showToast("No recent order found.");
      navigate('/');
    }
  }, [latestOrder, navigate, showToast]);

  if (!latestOrder) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden animate-[slideUp_0.4s_ease-out]">
        
        {/* Success Header */}
        <div className="bg-green-500 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <FiCheckCircle className="text-5xl" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Order Placed!</h1>
          <p className="font-medium text-green-100">Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Order ID</p>
              <p className="text-lg font-extrabold text-gray-900">#{latestOrder.orderId || latestOrder.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Amount</p>
              <p className="text-lg font-extrabold text-primary">₹{latestOrder.bill?.total || latestOrder.total}</p>
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Payment Method</p>
              <p className="text-md font-extrabold text-gray-800">{latestOrder.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Payment Status</p>
              <p className={`text-md font-extrabold uppercase ${latestOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                {latestOrder.paymentStatus === 'paid' ? 'PAID' : (latestOrder.paymentStatus === 'pending' ? 'PAYMENT PENDING' : latestOrder.paymentStatus)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600">
                <FiShoppingBag className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{latestOrder.restaurantSnapshot?.name || latestOrder.restaurantName}</p>
                <p className="text-xs text-gray-500 font-medium">{latestOrder.items?.length || 0} {(latestOrder.items?.length || 0) === 1 ? 'item' : 'items'}</p>
              </div>
            </div>

            <hr className="border-dashed border-gray-200 mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600">
                <FiClock className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Estimated delivery</p>
                <p className="text-sm text-gray-500 font-medium">30-35 minutes</p>
              </div>
            </div>

            <hr className="border-dashed border-gray-200 mb-4" />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 flex-shrink-0">
                <FiMapPin className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Delivery Address</p>
                <p className="text-sm text-gray-500 font-medium line-clamp-2">
                  {latestOrder.addressSnapshot?.addressLine || latestOrder.address?.house}, {latestOrder.addressSnapshot?.city || latestOrder.address?.city}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <FiTruck className="text-lg" /> Track Order
            </button>
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-white border-2 border-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                View Order
              </button>
              <button 
                onClick={() => navigate('/restaurants')}
                className="flex-1 bg-white border-2 border-gray-100 text-primary font-bold py-3 rounded-xl hover:bg-orange-50 hover:border-orange-100 transition-colors"
              >
                Continue Ordering
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;

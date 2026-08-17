import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiPackage, FiArrowRight } from 'react-icons/fi';

const OrdersPage = () => {
  const { orders } = useAppContext();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'placed':
      case 'confirmed':
      case 'preparing': 
      case 'out for delivery': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return '🟢';
      case 'cancelled': return '🔴';
      default: return '🟠';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your delicious journey starts here. Explore restaurants and place your first order!</p>
            <button 
              onClick={() => navigate('/restaurants')}
              className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.orderId || order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{order.restaurantSnapshot?.name || order.restaurantName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Order #{order.orderId || order.id}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex gap-4 mb-4 items-center">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-700">
                      Payment: {order.paymentMethod}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.paymentStatus === 'paid' ? 'PAID' : (order.paymentStatus === 'pending' ? 'PENDING' : order.paymentStatus.toUpperCase())}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {order.items.map((item, index) => (
                      <div key={item.cartItemId || item._id || item.foodId || index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">
                            {item.quantity} x {item.name}
                          </p>
                          {item.selectedCustomizations && (
                            <p className="text-[11px] text-gray-500 pl-6">
                              {item.selectedCustomizations.spiceLevel} 
                              {item.selectedCustomizations.addOns?.length > 0 && ` • +${item.selectedCustomizations.addOns.length} add-ons`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Amount</p>
                      <p className="text-lg font-extrabold text-gray-900">₹{order.bill?.total || order.total}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/orders/${order.orderId || order.id}`)}
                      className="flex items-center gap-2 text-primary font-bold hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      View Order <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

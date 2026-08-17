import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { getFavourites, addFavourite, removeFavourite } from '../services/favouriteService';
import { getAddresses, addAddress as apiAddAddress, editAddress as apiEditAddress, deleteAddress as apiDeleteAddress, setDefaultAddress as apiSetDefaultAddress } from '../services/addressService';

const AppContext = createContext();
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('foodrush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AppProvider = ({ children }) => {
  const [location, setLocation] = useState("Chennai");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Isolated States
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("foodrush_cart");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isHex24 = /^[a-fA-F0-9]{24}$/;
          return parsed.filter(item => {
            if (!item) return false;
            const foodId = item.foodId || item._id || item.id || (item.food && item.food.id);
            const restId = item.restaurantId || (item.restaurant && item.restaurant.id);
            return foodId && restId && isHex24.test(String(foodId)) && isHex24.test(String(restId));
          }).map(item => ({
            ...item,
            foodId: item.foodId || item._id || item.id || (item.food && item.food.id),
            restaurantId: item.restaurantId || (item.restaurant && item.restaurant.id)
          }));
        }
      } catch(e) {
        console.error("Error parsing cart from localStorage", e);
      }
    }
    return [];
  });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('foodrush_preferences');
    return saved ? JSON.parse(saved) : { promo: true, orderUpdates: true };
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUserData = async () => {
    try {
      const [favRes, addrRes, orderRes, cartRes] = await Promise.all([
        getFavourites(),
        getAddresses(),
        api.get('/orders/my'),
        api.get('/cart')
      ]);
      setFavorites(favRes.data.data.map(f => f.restaurant)); // Just IDs
      setAddresses(addrRes.data.data);
      setOrders(orderRes.data.data || []);
      
      const fetchedCart = cartRes.data.data?.items || [];
      
      // Clean up stale mock items from localStorage cart if any
      setCart(prev => {
        let validCart = prev.filter(item => {
          const foodId = item.foodId || item._id || item.id;
          const restId = item.restaurantId;
          // Valid MongoDB ObjectIds are 24-character hex strings
          const isHex24 = /^[a-fA-F0-9]{24}$/;
          return foodId && restId && isHex24.test(String(foodId)) && isHex24.test(String(restId));
        });
        
        // If we have backend items, they override local if local is empty/stale
        if (validCart.length === 0 && fetchedCart.length > 0) {
          validCart = fetchedCart;
        }
        
        return validCart;
      });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('foodrush_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          await loadUserData();
        } catch (error) {
          sessionStorage.removeItem('foodrush_token');
          setUser(null);
        }
      }
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('foodrush_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('foodrush_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Actions
  const login = async (loginData) => {
    const res = await api.post('/auth/login', loginData);
    sessionStorage.setItem('foodrush_token', res.data.token);
    setUser(res.data.user);
    await loadUserData();
    showToast(`Welcome back, ${res.data.user.name}!`);
    return res.data;
  };

  const signup = async (signupData) => {
    const res = await api.post('/auth/signup', signupData);
    console.log("signup response:", res.data);
    sessionStorage.setItem('foodrush_token', res.data.token);
    setUser(res.data.user);
    setFavorites([]); setAddresses([]); setOrders([]); // Fresh state
    showToast(`Welcome to FoodRush, ${res.data.user.name}!`);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('foodrush_token');
    // CLEAR ISOLATED DATA
    setFavorites([]);
    setAddresses([]);
    setOrders([]);
    showToast('Logged out successfully.');
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/users/me', updates);
    setUser(res.data.user);
    showToast('Profile updated successfully');
    return res.data;
  };

  // Address Actions
  const addAddress = async (address) => {
    try {
      const res = await apiAddAddress(address);
      setAddresses(prev => [...prev.map(a => address.isDefault ? { ...a, isDefault: false } : a), res.data.data]);
    } catch (err) {
      showToast("Error adding address");
    }
  };

  const editAddress = async (updatedAddress) => {
    try {
      const res = await apiEditAddress(updatedAddress._id || updatedAddress.id, updatedAddress);
      setAddresses(prev => prev.map(addr => (addr._id || addr.id) === res.data.data._id ? res.data.data : (updatedAddress.isDefault ? { ...addr, isDefault: false } : addr)));
    } catch (err) {
      showToast("Error updating address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      await apiDeleteAddress(id);
      setAddresses(prev => prev.filter(addr => (addr._id || addr.id) !== id));
    } catch (err) {
      showToast("Error deleting address");
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      await apiSetDefaultAddress(id);
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: (addr._id || addr.id) === id })));
    } catch (err) {
      showToast("Error setting default address");
    }
  };

  // Order Actions
  const placeOrder = async (orderData) => {
    try {
      const res = await api.post('/orders', orderData);
      setOrders(prev => [res.data.data, ...prev]);
      clearCart();
    } catch (err) {
      showToast("Error placing order");
      throw err;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.orderId === orderId || o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      showToast("Error cancelling order");
      throw err;
    }
  };

  // Cart Sync Action
  const syncCartWithBackend = async (newItems) => {
    if (user) {
      try {
        await api.put('/cart', { items: newItems });
      } catch (err) {
        console.error("Failed to sync cart:", err);
      }
    }
  };

  const executeAddToCart = (item, restaurantId, quantity, selectedCustomizations, basePrice) => {
    setCart(prev => {
      const existingItemIndex = prev.findIndex(
        cartItem =>
          cartItem.foodId === (item._id || item.id) &&
          JSON.stringify(cartItem.selectedCustomizations) === JSON.stringify(selectedCustomizations)
      );

      let newCart;
      if (existingItemIndex >= 0) {
        newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
      } else {
        newCart = [...prev, {
          cartItemId: Date.now().toString(36) + Math.random().toString(36).substr(2),
          foodId: item._id || item.id,
          name: item.name,
          image: item.image,
          price: basePrice || item.price,
          quantity,
          restaurantId,
          selectedCustomizations: selectedCustomizations || {}
        }];
      }
      syncCartWithBackend(newCart);
      return newCart;
    });
  };

  const addToCart = (item, restaurantId, quantity = 1, selectedCustomizations = null, basePrice = 0) => {
    if (!user) {
      showToast("Please login to add to cart");
      return;
    }
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      setPendingCartItem({ item, restaurantId, quantity, selectedCustomizations, basePrice });
      return;
    }
    executeAddToCart(item, restaurantId, quantity, selectedCustomizations, basePrice);
  };

  const confirmClearAndAdd = () => {
    setCart([]);
    syncCartWithBackend([]);
    if (pendingCartItem) {
      executeAddToCart(
        pendingCartItem.item,
        pendingCartItem.restaurantId,
        pendingCartItem.quantity,
        pendingCartItem.selectedCustomizations,
        pendingCartItem.basePrice
      );
      setPendingCartItem(null);
    }
  };

  const cancelClearAndAdd = () => {
    setPendingCartItem(null);
  };

  const updateCartItemQuantity = (identifier, delta) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if ((item.cartItemId && item.cartItemId === identifier) || 
            (item._id && item._id === identifier) || 
            (item.foodId && item.foodId === identifier)) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      }).filter(item => item.quantity > 0);
      syncCartWithBackend(newCart);
      return newCart;
    });
  };

  const removeCartItem = (identifier) => {
    setCart(prev => {
      const newCart = prev.filter(item => 
        item.cartItemId !== identifier && 
        item._id !== identifier && 
        item.foodId !== identifier
      );
      syncCartWithBackend(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCartWithBackend([]);
  };

  const toggleFavorite = async (restaurantId) => {
    if (!user) {
      showToast("Please login to favourite");
      return;
    }
    const idStr = String(restaurantId);
    try {
      if (favorites.includes(idStr)) {
        await removeFavourite(idStr);
        setFavorites(prev => prev.filter(id => id !== idStr));
      } else {
        await addFavourite(idStr);
        setFavorites(prev => [...prev, idStr]);
      }
    } catch (err) {
      showToast("Failed to update favourites");
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Derived state
  const cartCount = cart.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + ((Number(item?.price) || 0) * (Number(item?.quantity) || 0)), 0);
  const cartRestaurantId = cart.length > 0 ? cart[0].restaurantId : null;
  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <AppContext.Provider value={{
      cart, cartCount, cartTotal, cartRestaurantId,
      addToCart, updateCartItemQuantity, removeCartItem, clearCart,
      isCartDrawerOpen, setIsCartDrawerOpen,
      location, setLocation,
      isLocationModalOpen, setIsLocationModalOpen,
      toastMessage, showToast,
      favorites, toggleFavorite,
      addresses, addAddress, editAddress, deleteAddress, setDefaultAddress,
      orders, latestOrder, placeOrder, cancelOrder,
      user, loadingUser, login, signup, logout, updateProfile,
      preferences, setPreferences
    }}>
      {children}

      {pendingCartItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Items from another restaurant</h3>
            <p className="text-gray-600 mb-6">
              Your cart contains items from a different restaurant. Do you want to clear your existing cart and add this item?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelClearAndAdd}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAndAdd}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 transition-colors shadow-md"
              >
                Clear Cart & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-opacity duration-300">
          {toastMessage}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

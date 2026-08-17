import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, loadingUser } = useAppContext();
  const navigate = useNavigate();

  // If already logged in, redirect away
  if (!loadingUser && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'owner' || user.role === 'restaurant_owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const loginData = { email, password };
      const data = await login(loginData);
      const userRole = data.user.role;
      
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // Not an admin
        setError('You are not authorized to access the admin portal.');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to FoodRush server. Please make sure the backend is running on port 5000.');
      } else if (err.response.status === 401) {
        setError('Invalid admin email or password.');
      } else if (err.response.status === 403) {
        setError('You are not authorized to access the admin portal.');
      } else if (err.response.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">FoodRush Admin</h1>
          <h2 className="text-xl font-bold text-gray-500">Admin Portal</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input 
                type="email" 
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@foodrush.com"
                className="flex-1 px-4 py-3 bg-transparent outline-none font-medium text-gray-900"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="flex-1 px-4 py-3 bg-transparent outline-none font-medium text-gray-900"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 shadow-md transition-colors mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center text-sm font-bold text-gray-500">
        <p>&copy; {new Date().getFullYear()} FoodRush Inc. Secure System.</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;

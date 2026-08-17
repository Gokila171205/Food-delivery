import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both email/phone and password');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      // Determine if identifier is an email or phone
      const isEmail = identifier.includes('@');
      const loginData = {
        password,
        ...(isEmail ? { email: identifier } : { phone: identifier.replace(/\D/g, '') })
      };

      const data = await login(loginData);
      const userRole = data.user.role;
      
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'owner' || userRole === 'restaurant_owner') {
        navigate('/owner', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-2">FoodRush</h1>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h2>
          <p className="text-gray-500">Login to continue ordering</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Email or Mobile Number</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input 
                type="text" 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Enter email or mobile number"
                className="flex-1 px-4 py-3 bg-transparent outline-none font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex-1 px-4 py-3 bg-transparent outline-none font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 shadow-md transition-colors mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-600 font-medium">
            New to FoodRush? <Link to="/signup" className="text-primary font-bold hover:underline">Create an account</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-6 max-w-xs mx-auto">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

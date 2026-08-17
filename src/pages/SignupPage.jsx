import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      const data = await signup(signupData);
      const userRole = data.user.role;
      
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'owner' || userRole === 'restaurant_owner') {
        navigate('/owner', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error("Signup error:", err.message);
      const message = err.response?.data?.message || 'Signup failed. Please try again';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-2">FoodRush</h1>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500">Join us for delicious meals</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <div className="px-4 py-3 bg-gray-100 border-r border-gray-200 font-bold text-gray-700">+91</div>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                placeholder="Enter mobile number"
                className="flex-1 px-4 py-3 bg-transparent outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium mb-2"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 shadow-md transition-colors mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>

          <p className="text-center text-sm text-gray-600 font-medium mt-6">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

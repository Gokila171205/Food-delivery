import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const initialForm = {
  type: 'Home',
  name: '',
  phone: '',
  house: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
};

const AddressModal = ({ isOpen, onClose, editData }) => {
  const { addAddress, editAddress } = useAppContext();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editData) setFormData(editData);
      else setFormData(initialForm);
      setErrors({});
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'This field is required.';
    
    if (!formData.phone.trim()) newErrors.phone = 'This field is required.';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number.';
    
    if (!formData.house.trim()) newErrors.house = 'This field is required.';
    if (!formData.street.trim()) newErrors.street = 'This field is required.';
    if (!formData.city.trim()) newErrors.city = 'This field is required.';
    if (!formData.state.trim()) newErrors.state = 'This field is required.';
    
    if (!formData.pincode.trim()) newErrors.pincode = 'This field is required.';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      if (editData) {
        editAddress(formData);
      } else {
        addAddress(formData);
      }
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-[slideUp_0.3s_ease-out]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">{editData ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Address Type</label>
            <div className="flex gap-4">
              {['Home', 'Work', 'Other'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input 
                    type="radio" 
                    name="type" 
                    value={type} 
                    checked={formData.type === type} 
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">House / Flat / Building</label>
            <input type="text" name="house" value={formData.house} onChange={handleChange} placeholder="Enter house number" className={`w-full bg-gray-50 border ${errors.house ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
            {errors.house && <p className="text-red-500 text-xs mt-1 font-medium">{errors.house}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Street / Area</label>
            <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Enter street or area" className={`w-full bg-gray-50 border ${errors.street ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
            {errors.street && <p className="text-red-500 text-xs mt-1 font-medium">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" className={`w-full bg-gray-50 border ${errors.city ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
              {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
              <select name="state" value={formData.state} onChange={handleChange} className={`w-full bg-gray-50 border ${errors.state ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`}>
                <option value="">Select state</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1 font-medium">{errors.state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Enter pincode" className={`w-full bg-gray-50 border ${errors.pincode ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:ring-primary/30'} rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`} />
              {errors.pincode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Landmark <span className="font-normal text-gray-400">(Optional)</span></label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Optional" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex gap-4 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-3 font-bold text-white bg-primary rounded-xl hover:bg-orange-600 shadow-md transition-colors">Save Address</button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;

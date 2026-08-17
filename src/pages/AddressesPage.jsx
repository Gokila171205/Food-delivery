import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AddressModal from '../components/AddressModal';

const AddressesPage = () => {
  const { addresses, deleteAddress, setDefaultAddress } = useAppContext();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  const openAddAddress = () => {
    setEditAddressData(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditAddressData(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to remove this saved address?')) {
      deleteAddress(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Saved Addresses</h1>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6 font-medium">You don't have any saved addresses yet.</p>
              <button 
                onClick={openAddAddress}
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-md"
              >
                + Add New Address
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {addresses.map(addr => (
                  <div key={addr.id} className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">
                        {addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{addr.type}</span>
                          {addr.isDefault && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><FiCheckCircle /> Default</span>}
                        </div>
                        <p className="font-bold text-gray-800 text-sm mb-1">{addr.name}</p>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                          {addr.house}, {addr.street}<br/>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        
                        <div className="flex gap-4 text-sm font-bold">
                          <button onClick={() => openEditAddress(addr)} className="text-primary flex items-center gap-1 hover:underline"><FiEdit2 /> Edit</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 flex items-center gap-1 hover:underline"><FiTrash2 /> Delete</button>
                          {!addr.isDefault && (
                            <button onClick={() => setDefaultAddress(addr.id)} className="text-gray-500 hover:text-gray-900 flex items-center gap-1">Set Default</button>
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
            </>
          )}
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

export default AddressesPage;

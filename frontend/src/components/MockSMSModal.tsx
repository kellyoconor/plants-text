import React from 'react';
import { X, MessageCircle } from 'lucide-react';

interface MockSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  message: string;
  phoneNumber: string;
}

const MockSMSModal: React.FC<MockSMSModalProps> = ({ 
  isOpen, 
  onClose, 
  plantName, 
  message,
  phoneNumber 
}) => {
  if (!isOpen) return null;

  // Format phone number for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <MessageCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Your plant just texted you!</h2>
          </div>
          <p className="text-green-100 text-sm">
            This is what {plantName} would send to {formatPhone(phoneNumber)}
          </p>
        </div>

        {/* iPhone-style SMS Preview */}
        <div className="p-6 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* iPhone status bar */}
            <div className="bg-gray-100 px-4 py-2 flex justify-between items-center text-xs text-gray-600">
              <span className="font-semibold">Messages</span>
              <div className="flex items-center space-x-1">
                <span>9:41 AM</span>
              </div>
            </div>

            {/* Contact header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {plantName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{plantName}</p>
                <p className="text-xs text-gray-500">Plant Friend 🌱</p>
              </div>
            </div>

            {/* Message bubble */}
            <div className="p-4 bg-gray-50 min-h-[200px] flex flex-col justify-end">
              <div className="flex justify-start mb-2">
                <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>
            </div>

            {/* iPhone message input (decorative) */}
            <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
                iMessage
              </div>
              <div className="text-blue-500 font-semibold">↑</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Demo Mode:</strong> SMS integration not enabled yet. This shows what your plant would text you!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockSMSModal;


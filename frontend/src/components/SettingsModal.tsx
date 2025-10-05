import React, { useState } from 'react';
import { X, Phone, FileText, Shield, Trash2, LogOut } from 'lucide-react';
import { messages } from '../utils/messages';
import ConfirmationModal from './ConfirmationModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone: string;
  onDeleteAccount: () => Promise<void>;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userPhone,
  onDeleteAccount,
  onLogout,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      await onDeleteAccount();
      // Success - modal will close when user is logged out
    } catch (error) {
      console.error('Failed to delete account:', error);
      setDeleteError(messages.errors.generic.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 font-body">Settings</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Phone Number Section */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 font-body">Phone Number</p>
                  <p className="text-sm text-gray-600 font-body mt-1">{userPhone}</p>
                  <p className="text-xs text-gray-500 font-body mt-1">
                    Text STOP to any plant message to unsubscribe
                  </p>
                </div>
              </div>

              {/* Legal Links */}
              <div className="space-y-2">
                <a
                  href="/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <FileText className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                  <span className="text-sm font-medium text-gray-900 font-body group-hover:text-green-600">
                    Terms of Service
                  </span>
                </a>
                
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <Shield className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                  <span className="text-sm font-medium text-gray-900 font-body group-hover:text-green-600">
                    Privacy Policy
                  </span>
                </a>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Actions */}
              <div className="space-y-2">
                {/* Logout Button */}
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-sm font-medium text-gray-900 font-body">
                    Log Out
                  </span>
                </button>

                {/* Delete Account Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center space-x-3 p-4 hover:bg-red-50 rounded-xl transition-colors group"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600 font-body">
                    Delete Account
                  </span>
                </button>
              </div>

              {/* Error Message */}
              {deleteError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-body">{deleteError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500 font-body text-center">
                Plant Texts v1.0 • Made with 🌱 for plant parents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteError('');
        }}
        onConfirm={handleDeleteAccount}
        title={messages.confirmations.deleteAccount.title}
        message={messages.confirmations.deleteAccount.message}
        confirmText={messages.confirmations.deleteAccount.confirmText}
        cancelText={messages.confirmations.deleteAccount.cancelText}
        isDangerous={true}
        isLoading={isDeleting}
      />
    </>
  );
};

export default SettingsModal;

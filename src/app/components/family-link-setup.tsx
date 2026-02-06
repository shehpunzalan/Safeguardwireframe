import { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, Phone, CheckCircle, X } from 'lucide-react';
import * as AlertsAPI from '@/app/api/emergency-alerts-api';

interface FamilyLinkSetupProps {
  familyPhone: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function FamilyLinkSetup({ familyPhone, onComplete, onSkip }: FamilyLinkSetupProps) {
  const [elderlyPhone, setElderlyPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLink = async () => {
    if (!elderlyPhone.trim()) {
      setError('Please enter elderly user phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AlertsAPI.linkFamilyMember(elderlyPhone, familyPhone);
      setSuccess(true);
      
      // Save to localStorage that setup was completed
      localStorage.setItem('safeguard_family_link_setup_done', 'true');
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to link accounts. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Save that user skipped setup
    localStorage.setItem('safeguard_family_link_setup_skipped', 'true');
    onSkip();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Successfully Linked!</h2>
          <p className="text-gray-600">
            You will now receive emergency alerts from the elderly user.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Link Family Account</h2>
              <p className="text-sm text-gray-500">Get emergency alerts</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Link your account</strong> to receive emergency alerts from an elderly family member.
            You'll get instant notifications when they press the emergency button.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={familyPhone}
                disabled
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">This is your registered phone number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elderly User's Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={elderlyPhone}
                onChange={(e) => setElderlyPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the phone number of the elderly user you want to monitor
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLink}
            disabled={loading || !elderlyPhone.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Linking...
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Link Accounts
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>How it works:</strong> When the elderly user presses their emergency button,
            you'll receive an instant alert with their location and medical information.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { MapPin, Bell, FileText, CheckCircle, X } from "lucide-react";

interface EmergencyRequestSentProps {
  onViewGuidance: () => void;
  onCancel: () => void;
}

export function EmergencyRequestSent({ onViewGuidance, onCancel }: EmergencyRequestSentProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center p-6 pt-12">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-3xl font-bold text-[#8B1A1A] text-center mb-8">
          Emergency Request Sent
        </h1>

        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Status Cards */}
        <div className="space-y-3 mb-6">
          {/* Location Sharing */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Location Sharing</h3>
              <p className="text-sm text-blue-600">
                Your location is being shared with emergency services
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          </div>

          {/* Alert Notification */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Alert Notification</h3>
              <p className="text-sm text-blue-600">
                Emergency contacts have been notified
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          </div>

          {/* Medical Information Access */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Medical Information Access</h3>
              <p className="text-sm text-blue-600">
                Medical records shared with responders
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onViewGuidance}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Emergency Guidance
          </button>

          <button
            onClick={handleCancelClick}
            className="w-full bg-white text-red-600 py-4 rounded-xl font-bold text-base border-2 border-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel Emergency
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Cancel Emergency Request?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Are you sure you want to cancel this emergency request? Emergency services and your
              contacts will be notified.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleConfirmCancel}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Cancel Emergency
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                No, Keep Active
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
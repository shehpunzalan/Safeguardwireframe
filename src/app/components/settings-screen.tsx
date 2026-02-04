import { useState } from "react";
import { ArrowLeft, User, Type, Eye, Mic, Bell, Lock, Shield, Info, ChevronRight, ChevronDown, X } from "lucide-react";
import { useAccessibility } from "@/app/contexts/accessibility-context";

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  currentUser?: {
    pin: string;
  };
}

export function SettingsScreen({ onBack, onEditProfile, currentUser }: SettingsScreenProps) {
  const { settings, updateSettings, speak } = useAccessibility();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showChangePINModal, setShowChangePINModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [currentPIN, setCurrentPIN] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [pinError, setPinError] = useState("");

  const handleChangePIN = () => {
    setPinError("");
    
    // Verify current PIN
    if (currentUser && currentPIN !== currentUser.pin) {
      setPinError("Current PIN is incorrect!");
      return;
    }
    
    // Validate new PIN
    if (newPIN.length !== 4) {
      setPinError("PIN must be 4 digits!");
      return;
    }
    
    if (newPIN !== confirmPIN) {
      setPinError("New PINs do not match!");
      return;
    }
    
    if (currentPIN === newPIN) {
      setPinError("New PIN must be different from current PIN!");
      return;
    }

    // Update PIN in localStorage
    if (currentUser) {
      const accountsJson = localStorage.getItem("safeguard_accounts");
      if (accountsJson) {
        const accounts = JSON.parse(accountsJson);
        const userIndex = accounts.findIndex((acc: any) => acc.pin === currentUser.pin);
        if (userIndex !== -1) {
          accounts[userIndex].pin = newPIN;
          localStorage.setItem("safeguard_accounts", JSON.stringify(accounts));
          alert("PIN changed successfully!");
          setShowChangePINModal(false);
          setCurrentPIN("");
          setNewPIN("");
          setConfirmPIN("");
          setPinError("");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-md mx-auto p-5 pb-8">
        {/* Profile Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Profile</h2>
          <button
            onClick={onEditProfile}
            className="w-full bg-white rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">Edit Profile</h3>
              <p className="text-sm text-gray-600">Update personal and medical information</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Accessibility Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Accessibility</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Large Text */}
            <div className="p-4 flex items-center gap-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Type className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">Large Text</h3>
                <p className="text-sm text-gray-600">Increase text size throughout the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => updateSettings({ largeText: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* High Contrast Mode */}
            <div className="p-4 flex items-center gap-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">High Contrast Mode</h3>
                <p className="text-sm text-gray-600">Enhance visibility with higher contrast</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Voice Commands */}
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">Voice Commands</h3>
                <p className="text-sm text-gray-600">Enable voice-activated controls</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceCommands}
                  onChange={(e) => updateSettings({ voiceCommands: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Text Size Slider */}
          <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Text Size: {settings.textSize}px</h3>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.textSize}
              onChange={(e) => updateSettings({ textSize: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((settings.textSize - 12) / 12) * 100}%, #e5e7eb ${((settings.textSize - 12) / 12) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Language & Region</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Language Selection</h3>
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <span className="text-gray-900">{settings.language}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                  {["English", "Spanish", "French", "German", "Chinese"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        updateSettings({ language: lang });
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                        settings.language === lang ? "bg-blue-50" : ""
                      }`}
                    >
                      {settings.language === lang && (
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className={settings.language === lang ? "text-blue-600 font-medium" : "text-gray-900"}>
                        {lang}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Notifications</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-600">Receive emergency alerts and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Privacy & Security</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowChangePINModal(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">Change PIN</h3>
                <p className="text-sm text-gray-600">Update your security PIN</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">Privacy Policy</h3>
                <p className="text-sm text-gray-600">View our privacy policy</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">About</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">SafeGuard</h3>
                <p className="text-sm text-gray-600">Version 1.0.0</p>
                <p className="text-xs text-gray-500">Emergency Response System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text Preview */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-2">Text Preview</h3>
          <p className="text-gray-700" style={{ fontSize: `${settings.textSize}px` }}>
            The quick brown fox jumps over the lazy dog. This is a sample text to preview your accessibility settings.
          </p>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showChangePINModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change PIN</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Current PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPIN}
                  onChange={(e) => setCurrentPIN(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter current 4-digit PIN"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPIN}
                  onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPIN}
                  onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                  placeholder="Re-enter PIN"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-2xl tracking-widest"
                />
              </div>
            </div>

            {pinError && (
              <div className="text-red-500 text-sm mb-4">
                {pinError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleChangePIN}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Change PIN
              </button>
              <button
                onClick={() => {
                  setShowChangePINModal(false);
                  setCurrentPIN("");
                  setNewPIN("");
                  setConfirmPIN("");
                  setPinError("");
                }}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Privacy Policy</h3>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  <strong>Effective Date:</strong> February 4, 2026
                </p>

                <p className="text-gray-700">
                  SafeGuard is committed to protecting the privacy of its users. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to protect it.
                </p>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h4>
                  <p className="text-gray-700 mb-2">
                    We collect the following types of information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Personal information (name, phone number, email address)</li>
                    <li>Medical information (blood type, allergies, conditions, medications)</li>
                    <li>Emergency contact information</li>
                    <li>Location data (when emergency services are activated)</li>
                    <li>Account credentials (phone number and PIN)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h4>
                  <p className="text-gray-700 mb-2">
                    We use your information to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Provide and improve our emergency response services</li>
                    <li>Communicate with you and your emergency contacts</li>
                    <li>Share critical medical information with first responders during emergencies</li>
                    <li>Maintain and secure your account</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">3. Data Storage</h4>
                  <p className="text-gray-700">
                    This demonstration version stores all data locally in your browser's localStorage. In a production environment, data would be stored on secure servers with encryption and regular backups.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">4. Data Security</h4>
                  <p className="text-gray-700">
                    We take reasonable measures to protect your information from unauthorized access, use, or disclosure. This includes PIN-based authentication, secure data transmission, and access controls. However, no method of transmission over the internet or method of electronic storage is 100% secure.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">5. Information Sharing</h4>
                  <p className="text-gray-700 mb-2">
                    We may share your information with:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Emergency services (911, paramedics, hospitals) during active emergencies</li>
                    <li>Your designated emergency contacts when you trigger an emergency alert</li>
                    <li>Healthcare providers as necessary for your safety</li>
                    <li>Law enforcement when required by law</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">6. Your Rights</h4>
                  <p className="text-gray-700 mb-2">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Access your personal information</li>
                    <li>Correct or update your information through the Edit Profile screen</li>
                    <li>Delete your account and associated data</li>
                    <li>Request that we stop processing your information (subject to emergency service requirements)</li>
                    <li>Change your security PIN at any time</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">7. Location Services</h4>
                  <p className="text-gray-700">
                    SafeGuard may request access to your device's location services to provide accurate emergency response. You can control location permissions through your device settings. Location data is only accessed during active emergencies or when explicitly requested by family members monitoring your safety.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">8. Children's Privacy</h4>
                  <p className="text-gray-700">
                    SafeGuard is designed for elderly users and their adult family members. We do not knowingly collect information from individuals under the age of 18.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">9. Changes to This Policy</h4>
                  <p className="text-gray-700">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">10. Contact Us</h4>
                  <p className="text-gray-700">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-gray-700 mt-2">
                    Email: privacy@safeguardapp.com<br />
                    Phone: 1-800-SAFEGUARD<br />
                    Address: 123 Safety Street, Protection City, SC 12345
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
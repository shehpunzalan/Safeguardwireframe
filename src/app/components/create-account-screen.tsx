import { useState } from "react";
import { User, Phone, Mail, Users, Lock, ArrowLeft, ChevronDown } from "lucide-react";

interface CreateAccountScreenProps {
  onCreateAccount: (userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    bloodType: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    pin: string;
    userType: "elderly" | "family";
  }) => void;
  onBack: () => void;
  onLogin?: () => void;
}

export function CreateAccountScreen({ onCreateAccount, onBack, onLogin }: CreateAccountScreenProps) {
  const [userType, setUserType] = useState<"elderly" | "family">("elderly");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    pin: "",
    confirmPin: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setError("");

    // Base validation for all user types
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.pin ||
      !formData.confirmPin
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Additional validation for elderly users
    if (userType === "elderly") {
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        setError("Please fill in emergency contact information");
        return;
      }
    }

    if (formData.pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    onCreateAccount({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      bloodType: formData.bloodType,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      pin: formData.pin,
      userType: userType,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Create Account</h1>
      </div>

      {/* Scrollable Form */}
      <div className="max-w-md mx-auto p-6 pb-24">
        {/* User Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setUserType("elderly")}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              userType === "elderly"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-300"
            }`}
          >
            Elderly User
          </button>
          <button
            onClick={() => setUserType("family")}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              userType === "family"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-300"
            }`}
          >
            Family Member
          </button>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="John Doe"
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Blood Type - Only for Elderly Users */}
        {userType === "elderly" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Blood Type</label>
            <div className="relative">
              <select
                value={formData.bloodType}
                onChange={(e) => handleChange("bloodType", e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Emergency Contact Name - Only for Elderly Users */}
        {userType === "elderly" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Emergency Contact Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                placeholder="Emergency contact name"
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {/* Emergency Contact Phone - Only for Elderly Users */}
        {userType === "elderly" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Emergency Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {/* Create PIN */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Create PIN</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-digit PIN"
              maxLength={4}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Confirm PIN */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Confirm PIN</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={formData.confirmPin}
              onChange={(e) =>
                handleChange("confirmPin", e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Confirm PIN"
              maxLength={4}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">
              I agree to the{" "}
              <span className="text-blue-600 font-medium">Terms of Service</span> and{" "}
              <span className="text-blue-600 font-medium">Privacy Policy</span>
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                By creating an account, you agree to SafeGuard's terms and conditions
              </span>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Create Account Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Create Account
        </button>

        {/* Login Link */}
        {onLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={onLogin}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Already have an account? Login here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
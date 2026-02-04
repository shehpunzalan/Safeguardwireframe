import { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Camera } from "lucide-react";

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: (data: ProfileData) => void;
  initialData?: ProfileData;
}

export interface ProfileData {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export function EditProfileScreen({ onBack, onSave, initialData }: EditProfileScreenProps) {
  const [formData, setFormData] = useState<ProfileData>(
    initialData || {
      fullName: "John Doe",
      phoneNumber: "+1 (555) 123-4567",
      email: "john.doe@example.com",
      address: "123 Oak Street, Springfield, IL 62701",
      bloodType: "O+",
      allergies: "Penicillin, Latex",
      medicalConditions: "High Blood Pressure, Type 2 Diabetes",
      currentMedications: "Lisinopril 10mg (daily), Metformin 500mg (twice daily)",
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+1 (555) 987-6543",
      emergencyContactRelationship: "Daughter",
    }
  );

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Edit Profile</h1>
      </div>

      <div className="max-w-md mx-auto p-5 pb-32">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 mb-4 text-center">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center border-2 border-white">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          <button className="text-blue-600 font-semibold text-sm">Change Photo</button>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Medical Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => handleChange("bloodType", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
              >
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Allergies</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
                placeholder="e.g., Penicillin, Latex"
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Medical Conditions
              </label>
              <textarea
                value={formData.medicalConditions}
                onChange={(e) => handleChange("medicalConditions", e.target.value)}
                placeholder="e.g., High Blood Pressure, Type 2 Diabetes"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Current Medications
              </label>
              <textarea
                value={formData.currentMedications}
                onChange={(e) => handleChange("currentMedications", e.target.value)}
                placeholder="e.g., Lisinopril 10mg (daily)"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Primary Emergency Contact */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Primary Emergency Contact</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Relationship</label>
              <input
                type="text"
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onBack}
            className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

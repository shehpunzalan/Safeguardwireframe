import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, Clock, CheckCircle, Activity, Bell, Phone, MessageCircle } from "lucide-react";

interface EmergencyAlertScreenProps {
  elderlyUserName: string;
  elderlyAge: number;
  elderlyPhone: string;
  elderlyEmail: string;
  elderlyAddress: string;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  onBack: () => void;
}

export function EmergencyAlertScreen({
  elderlyUserName,
  elderlyAge,
  elderlyPhone,
  elderlyEmail,
  elderlyAddress,
  bloodType,
  allergies,
  medicalConditions,
  medications,
  onBack,
}: EmergencyAlertScreenProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  
  // GPS State
  const [location, setLocation] = useState({
    latitude: 39.7817,
    longitude: -89.6501,
    address: "123 Oak Street, Springfield, IL 62701",
    lastUpdated: new Date(),
    accuracy: 0,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationHistory, setLocationHistory] = useState([
    { time: "2 minutes ago", address: "123 Oak Street, Springfield, IL 62701", lat: 39.7817, lng: -89.6501 },
    { time: "10 minutes ago", address: "456 Maple Avenue, Springfield, IL 62701", lat: 39.7820, lng: -89.6505 },
  ]);

  // Auto-refresh GPS every 30 seconds
  useEffect(() => {
    handleGetLiveLocation();
    
    const interval = setInterval(() => {
      handleGetLiveLocation();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = () => {
    setAcknowledged(true);
  };

  const handleCall = () => {
    window.location.href = `tel:${elderlyPhone}`;
  };

  const handleMessage = () => {
    window.location.href = `sms:${elderlyPhone}`;
  };

  const handleCall911 = () => {
    window.location.href = "tel:911";
  };

  // Get live GPS location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const now = new Date();
        
        // Add to location history
        const newHistoryItem = {
          time: "Just now",
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          lat: latitude,
          lng: longitude,
        };
        
        setLocationHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);
        
        // Update current location
        setLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          lastUpdated: now,
          accuracy,
        });
        
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        // Silently fail and keep using last known location
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Open navigation app with directions
  const handleGetDirections = () => {
    const { latitude, longitude } = location;
    
    // Detect if user is on iOS or Android for better app integration
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let mapsUrl = "";
    
    if (isIOS) {
      // Try to open Apple Maps first
      mapsUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
      window.location.href = mapsUrl;
      
      // Fallback to Google Maps if Apple Maps doesn't open
      setTimeout(() => {
        window.open(`https://maps.google.com/?daddr=${latitude},${longitude}`, "_blank");
      }, 500);
    } else if (isAndroid) {
      // Open Google Maps app or web
      mapsUrl = `google.navigation:q=${latitude},${longitude}`;
      window.location.href = mapsUrl;
      
      // Fallback to web version
      setTimeout(() => {
        window.open(`https://maps.google.com/?daddr=${latitude},${longitude}`, "_blank");
      }, 500);
    } else {
      // Desktop or other - open Google Maps in new tab
      window.open(`https://maps.google.com/?daddr=${latitude},${longitude}`, "_blank");
    }
  };

  // Get time since last update
  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - location.lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-1 hover:bg-red-700 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <h1 className="text-xl font-bold">EMERGENCY ALERT</h1>
          </div>
        </div>
        <p className="text-sm text-red-100 ml-11">Active emergency request</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Location Tracking */}
        <div className="bg-white rounded-xl p-5 shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Location Tracking</h2>
            </div>
            <button
              onClick={handleGetLiveLocation}
              disabled={gpsLoading}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  <span>Refresh GPS</span>
                </>
              )}
            </button>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-6 mb-4 relative h-64 flex items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
            {/* Home Base */}
            <div className="absolute bottom-12 left-12 flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 mt-1 bg-white px-2 py-1 rounded shadow">
                Home Base
              </span>
            </div>
            {/* User Location */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <MapPin className="w-6 h-6 text-white" fill="white" />
                </div>
              </div>
              <span className="text-xs font-semibold text-white mt-2 bg-red-600 px-3 py-1 rounded-full shadow-lg">
                {elderlyUserName}
              </span>
            </div>
            {/* Zoom Controls */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                +
              </button>
              <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                −
              </button>
            </div>
            {/* Navigation Button */}
            <button
              onClick={handleGetDirections}
              className="absolute right-3 bottom-3 w-10 h-10 bg-blue-600 text-white rounded shadow-md flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>

          {/* Current Location */}
          <div className="flex items-start gap-3 mb-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Current Location</h3>
              <p className="text-sm text-gray-700">{location.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">Last updated: {getTimeSinceUpdate()}</p>
                {location.accuracy > 0 && (
                  <span className="text-xs text-gray-500">• Accuracy: ±{location.accuracy.toFixed(0)}m</span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
            <button
              onClick={handleGetDirections}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          </div>

          {/* GPS Status */}
          <div className="flex items-center gap-2 justify-center text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-600 font-medium">GPS Active • Auto-refreshing every 30s</span>
          </div>
        </div>

        {/* Location History */}
        <div className="bg-white rounded-xl p-5 shadow-md mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Location History</h2>
          </div>

          <div className="space-y-2">
            {locationHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-600 font-medium">{item.time}</span>
                <span className="text-gray-700">{item.address}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Response Status */}
        <div className="bg-white rounded-xl p-5 shadow-md mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Emergency Response Status</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Emergency Services Reached</h3>
                <p className="text-sm text-gray-600">Contacted on Jan 23, 3:47 PM</p>
              </div>
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Ambulance Dispatched</h3>
                <p className="text-sm text-gray-600">ETA: 8-12 minutes</p>
              </div>
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                En Route
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Family Members Notified</h3>
                <p className="text-sm text-gray-600">4 of 6 contacts acknowledged</p>
              </div>
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                4 Acknowledged
              </span>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 text-white p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{elderlyUserName}</h2>
                <p className="text-red-100">Age {elderlyAge}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Alert triggered 5 minutes ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
            <p className="text-gray-700 mb-1">{elderlyPhone}</p>
            <p className="text-blue-600 text-sm">{elderlyEmail}</p>
          </div>

          {/* Address */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                <p className="text-gray-700">{elderlyAddress}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleCall}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call {elderlyUserName.split(" ")[0]}
              </button>
              <button
                onClick={handleMessage}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>
              <button
                onClick={handleCall911}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call 911
              </button>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Medical Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm text-gray-600 mb-1">Blood Type</h4>
                <p className="font-semibold text-red-600">{bloodType}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-600 mb-1">Known Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-600 mb-1">Medical Conditions</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  {medicalConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm text-gray-600 mb-1">Current Medications</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  {medications.map((medication, index) => (
                    <li key={index}>{medication}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Acknowledge Button */}
          <div className="p-5 bg-yellow-50 border-t-2 border-yellow-400">
            {!acknowledged ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-yellow-600 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Action Required</h3>
                    <p className="text-sm text-gray-700">
                      Please acknowledge that you have received this emergency alert
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAcknowledge}
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                >
                  Acknowledge Alert
                </button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Alert Acknowledged</h3>
                    <p className="text-sm text-gray-700">
                      You have acknowledged this emergency alert
                    </p>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

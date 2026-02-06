import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Settings,
  LogOut,
  Bell,
  AlertCircle,
  User,
  Navigation,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { ContactManagement, Contact } from "./contact-management";
import { EmergencyRequestSent } from "./emergency-request-sent";
import { EmergencyGuidance } from "./emergency-guidance";
import { useAccessibility } from "@/app/contexts/accessibility-context";
import { 
  getEmergencyAlerts, 
  addEmergencyAlert, 
  updateAlertStatus, 
  markAlertAsRead as markAlertAsReadLocal,
  markAllAlertsAsRead,
  getUnreadAlertsCount,
  formatAlertTime as formatAlertTimeLocal,
  type EmergencyAlert as LocalEmergencyAlert 
} from "@/app/utils/emergency-alerts";
import * as AlertsAPI from "@/app/api/emergency-alerts-api";

interface DashboardScreenProps {
  userName: string;
  userType: "elderly" | "family";
  onLogout: () => void;
  onSettings: () => void;
  onEmergencyAlert?: () => void;
}

export function DashboardScreen({
  userName,
  userType,
  onLogout,
  onSettings,
  onEmergencyAlert,
}: DashboardScreenProps) {
  const { speak } = useAccessibility();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyRequest, setShowEmergencyRequest] = useState(false);
  const [showEmergencyGuidance, setShowEmergencyGuidance] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Mary Johnson", relationship: "Daughter", phone: "+1 (555) 987-6543" },
    { id: "2", name: "Dr. Smith", relationship: "Doctor", phone: "+1 (555) 111-2222" },
    { id: "3", name: "Tom Wilson", relationship: "Son", phone: "+1 (555) 333-4444" },
  ]);
  
  // Emergency Alerts State
  const [emergencyAlerts, setEmergencyAlerts] = useState<LocalEmergencyAlert[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  
  // GPS State
  const [elderlyLocation, setElderlyLocation] = useState({
    latitude: 39.7817,
    longitude: -89.6501,
    address: "123 Main Street, Springfield, IL 62701",
    placeName: "Community Center",
    lastUpdated: "Just now",
    isLive: true,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Load emergency alerts for family dashboard
  useEffect(() => {
    if (userType === "family") {
      loadEmergencyAlerts();
      
      // Poll for new alerts every 5 seconds
      const interval = setInterval(loadEmergencyAlerts, 5000);
      
      // Listen for storage events (cross-tab communication)
      const handleStorageChange = () => {
        loadEmergencyAlerts();
      };
      
      window.addEventListener('emergency-alert-added', handleStorageChange);
      window.addEventListener('emergency-alert-updated', handleStorageChange);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('emergency-alert-added', handleStorageChange);
        window.removeEventListener('emergency-alert-updated', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [userType]);

  const loadEmergencyAlerts = async () => {
    // Get current user to use as family member ID
    const currentUser = JSON.parse(localStorage.getItem('safeguard_current_user') || '{}');
    const familyMemberId = `user:${currentUser.phoneNumber}`;
    
    try {
      // Try to fetch from backend first
      const backendAlerts = await AlertsAPI.getActiveAlertsForFamilyMember(familyMemberId);
      
      // Convert backend alerts to local format
      const convertedAlerts: LocalEmergencyAlert[] = backendAlerts.map(alert => ({
        id: alert.id,
        elderlyName: alert.elderlyName,
        elderlyPhone: alert.elderlyPhone,
        timestamp: alert.timestamp,
        status: alert.status,
        location: alert.location,
        medicalInfo: alert.medicalInfo,
        read: alert.readBy.includes(familyMemberId)
      }));
      
      setEmergencyAlerts(convertedAlerts);
      setUnreadAlertCount(convertedAlerts.filter(a => !a.read).length);
      
      console.log(`Loaded ${backendAlerts.length} alerts from backend`);
    } catch (error) {
      console.error('Failed to load alerts from backend, using localStorage:', error);
      // Fallback to localStorage
      const alerts = getEmergencyAlerts();
      setEmergencyAlerts(alerts);
      setUnreadAlertCount(getUnreadAlertsCount());
    }
  };

  const handleAddContact = (contact: Omit<Contact, "id">) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
    };
    setContacts([...contacts, newContact]);
  };

  const handleEditContact = (contact: Contact) => {
    setContacts(contacts.map((c) => (c.id === contact.id ? contact : c)));
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleEmergencyPress = async () => {
    speak("Emergency button pressed. Contacting emergency services.");
    
    // Create emergency alert
    const currentUser = JSON.parse(localStorage.getItem('safeguard_current_user') || '{}');
    const elderlyPhone = currentUser.phoneNumber || 'Unknown';
    const elderlyName = userName || currentUser.fullName || 'Elderly User';
    const elderlyEmail = currentUser.email || '';
    const elderlyUserId = `user:${elderlyPhone}`;
    
    const createAlert = (location: any) => {
      const alertData = {
        elderlyName,
        elderlyPhone,
        status: 'active' as const,
        location,
        medicalInfo: {
          bloodType: currentUser.bloodType,
          allergies: currentUser.allergies,
          medicalConditions: currentUser.medicalConditions,
          currentMedications: currentUser.currentMedications
        }
      };
      
      // Save to localStorage (local backup)
      addEmergencyAlert(alertData);
      
      // Send to Supabase backend for cross-device sync
      AlertsAPI.createEmergencyAlert(
        elderlyUserId,
        elderlyName,
        elderlyPhone,
        elderlyEmail,
        location,
        alertData.medicalInfo
      ).then(() => {
        console.log('Emergency alert sent to backend successfully');
      }).catch((error) => {
        console.error('Failed to send emergency alert to backend:', error);
        // Alert still saved locally, so app continues to work
      });
    };
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          createAlert({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        },
        () => {
          // Fallback to default location if GPS fails
          createAlert(elderlyLocation);
        }
      );
    } else {
      // No geolocation, use default location
      createAlert(elderlyLocation);
    }
    
    setShowEmergencyRequest(true);
  };

  const handleEmergencyConfirm = () => {
    setShowEmergencyRequest(false);
    setShowEmergencyGuidance(true);
  };

  // Get live GPS location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update location with real coordinates
        setElderlyLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          placeName: "Current Location",
          lastUpdated: "Just now",
          isLive: true,
        });
        
        setGpsLoading(false);
        
        // Optional: Reverse geocode to get address
        // You could call a geocoding API here to convert coordinates to address
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
    const { latitude, longitude } = elderlyLocation;
    
    // Detect if user is on iOS or Android for better app integration
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let mapsUrl = "";
    
    if (isIOS) {
      // Try to open Apple Maps first, fall back to Google Maps
      mapsUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
      
      // Fallback to Google Maps if Apple Maps doesn't open
      setTimeout(() => {
        window.open(`https://maps.google.com/?daddr=${latitude},${longitude}`, "_blank");
      }, 500);
    } else if (isAndroid) {
      // Open Google Maps app or web
      mapsUrl = `google.navigation:q=${latitude},${longitude}`;
      
      // Fallback to web version
      setTimeout(() => {
        window.open(`https://maps.google.com/?daddr=${latitude},${longitude}`, "_blank");
      }, 500);
    } else {
      // Desktop or other - open Google Maps in new tab
      mapsUrl = `https://maps.google.com/?daddr=${latitude},${longitude}`;
    }
    
    window.open(mapsUrl, "_blank");
  };

  // Open location in map view
  const handleViewOnMap = () => {
    const { latitude, longitude } = elderlyLocation;
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, "_blank");
  };

  if (showEmergencyRequest) {
    return (
      <EmergencyRequestSent
        onViewGuidance={handleEmergencyConfirm}
        onCancel={() => setShowEmergencyRequest(false)}
      />
    );
  }

  if (showEmergencyGuidance) {
    return <EmergencyGuidance onBack={() => setShowEmergencyGuidance(false)} />;
  }

  if (userType === "family") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Family Dashboard Header */}
        <div className="bg-blue-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Family Dashboard</h1>
              <p className="text-blue-100 text-sm">{userName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadAlertCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {unreadAlertCount}
                  </span>
                )}
              </button>
              <button onClick={onLogout} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-20 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white hover:bg-blue-700 rounded p-1"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {/* Emergency Alerts from localStorage */}
              {emergencyAlerts.filter(alert => alert.status === 'active').map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => {
                    markAlertAsReadLocal(alert.id);
                    setShowNotifications(false);
                    if (onEmergencyAlert) onEmergencyAlert();
                  }}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-red-50 transition-colors text-left ${
                    !alert.read ? 'bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-red-700">EMERGENCY ALERT</h4>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {alert.elderlyName} has triggered an emergency alert
                      </p>
                      {alert.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {alert.location.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatAlertTimeLocal(alert.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))}
              
              {emergencyAlerts.filter(alert => alert.status === 'active').length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">No active emergency alerts</p>
                </div>
              )}

              {/* Other notifications */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Medication Taken</h4>
                    <p className="text-sm text-gray-600">John took morning medication on time</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xl">📍</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Location Update</h4>
                    <p className="text-sm text-gray-600">Arrived at Community Center</p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-w-md mx-auto">
          {/* Emergency Alert Banner - Only show if there are active alerts */}
          {emergencyAlerts.filter(alert => alert.status === 'active').length > 0 && (
            <button
              onClick={() => {
                if (onEmergencyAlert) onEmergencyAlert();
              }}
              className="w-full bg-red-500 text-white p-4 rounded-2xl mb-5 flex items-start gap-3 hover:bg-red-600 transition-colors shadow-md animate-pulse"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">EMERGENCY ALERT ACTIVE</h3>
                <p className="text-sm text-red-100">
                  {emergencyAlerts.filter(alert => alert.status === 'active')[0]?.elderlyName} has triggered an emergency alert. Click for details.
                </p>
              </div>
            </button>
          )}

          {/* Live Location */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Live Location</h2>
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
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
            
            {/* GPS Error Message */}
            {gpsError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}
            
            {/* Map Area */}
            <button
              onClick={handleViewOnMap}
              className="w-full bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 text-center mb-4 relative hover:from-blue-100 hover:to-green-100 transition-all"
            >
              <div className="inline-flex items-center justify-center mb-3">
                <div className="relative">
                  <svg width="60" height="70" viewBox="0 0 24 32" fill="none">
                    <path
                      d="M12 0C7.58172 0 4 3.58172 4 8C4 14 12 24 12 24C12 24 20 14 20 8C20 3.58172 16.4183 0 12 0Z"
                      fill="#2563eb"
                    />
                    <circle cx="12" cy="8" r="3" fill="white" />
                  </svg>
                  {elderlyLocation.isLive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">Current Location</h3>
              <p className="text-gray-900 font-medium">{elderlyLocation.placeName}</p>
              <p className="text-sm text-gray-600">{elderlyLocation.address}</p>
              <p className="text-xs text-gray-500 mt-2">Last updated: {elderlyLocation.lastUpdated}</p>
              
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm font-medium mt-2">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                GPS Active
              </div>

              {/* Coordinates Display */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-mono">
                  {elderlyLocation.latitude.toFixed(6)}, {elderlyLocation.longitude.toFixed(6)}
                </p>
              </div>
            </button>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleGetDirections}
                className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>
            </div>

            {/* Distance Info (optional) */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Distance from you</span>
              </div>
              <span className="text-sm font-bold text-gray-900">~2.4 miles</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {/* Left home */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Left home at 9:30 AM</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>

              {/* Heart rate */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Heart rate: 72 bpm (Normal)</p>
                  <p className="text-sm text-gray-500">3 hours ago</p>
                </div>
              </div>

              {/* Medication */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Medication taken on time</p>
                  <p className="text-sm text-gray-500">5 hours ago</p>
                </div>
              </div>

              {/* Arrived */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Arrived at Community Center</p>
                  <p className="text-sm text-gray-500">6 hours ago</p>
                </div>
              </div>

              {/* Called */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Called Mary Johnson</p>
                  <p className="text-sm text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Management */}
          <ContactManagement
            contacts={contacts}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        </div>
      </div>
    );
  }

  // Elderly User Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Welcome back</p>
            <p className="font-bold text-gray-900">{userName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        {/* Emergency Button */}
        <motion.button
          onClick={handleEmergencyPress}
          whileTap={{ scale: 0.95 }}
          className="relative w-80 h-80 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex flex-col items-center justify-center text-white hover:from-red-600 hover:to-red-700 transition-all"
        >
          <div className="mb-4">
            <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-2">EMERGENCY</h2>
          <p className="text-xl">Tap for Emergency</p>
        </motion.button>

        {/* Status Indicators */}
        <div className="mt-8 flex gap-6">
          <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <div>
              <p className="text-xs text-gray-500">GPS Status</p>
              <p className="font-semibold text-gray-900">Active</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <div>
              <p className="text-xs text-gray-500">Sensor Status</p>
              <p className="font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
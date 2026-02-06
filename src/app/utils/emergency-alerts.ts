export interface EmergencyAlert {
  id: string;
  elderlyName: string;
  elderlyPhone: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'cancelled';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string;
    medicalConditions?: string;
    currentMedications?: string;
  };
  read: boolean;
}

// Get all emergency alerts
export function getEmergencyAlerts(): EmergencyAlert[] {
  const alertsJson = localStorage.getItem('safeguard_emergency_alerts');
  return alertsJson ? JSON.parse(alertsJson) : [];
}

// Add a new emergency alert
export function addEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'read'>): EmergencyAlert {
  const alerts = getEmergencyAlerts();
  
  const newAlert: EmergencyAlert = {
    ...alert,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  alerts.unshift(newAlert); // Add to beginning
  localStorage.setItem('safeguard_emergency_alerts', JSON.stringify(alerts));
  
  // Trigger storage event for cross-tab communication
  window.dispatchEvent(new Event('emergency-alert-added'));
  
  return newAlert;
}

// Update alert status
export function updateAlertStatus(alertId: string, status: 'active' | 'resolved' | 'cancelled'): void {
  const alerts = getEmergencyAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId ? { ...alert, status } : alert
  );
  localStorage.setItem('safeguard_emergency_alerts', JSON.stringify(updatedAlerts));
  window.dispatchEvent(new Event('emergency-alert-updated'));
}

// Mark alert as read
export function markAlertAsRead(alertId: string): void {
  const alerts = getEmergencyAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId ? { ...alert, read: true } : alert
  );
  localStorage.setItem('safeguard_emergency_alerts', JSON.stringify(updatedAlerts));
}

// Mark all alerts as read
export function markAllAlertsAsRead(): void {
  const alerts = getEmergencyAlerts();
  const updatedAlerts = alerts.map(alert => ({ ...alert, read: true }));
  localStorage.setItem('safeguard_emergency_alerts', JSON.stringify(updatedAlerts));
}

// Get unread alerts count
export function getUnreadAlertsCount(): number {
  const alerts = getEmergencyAlerts();
  return alerts.filter(alert => !alert.read && alert.status === 'active').length;
}

// Get active alerts (not resolved or cancelled)
export function getActiveAlerts(): EmergencyAlert[] {
  const alerts = getEmergencyAlerts();
  return alerts.filter(alert => alert.status === 'active');
}

// Delete old alerts (older than 30 days)
export function cleanOldAlerts(): void {
  const alerts = getEmergencyAlerts();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredAlerts = alerts.filter(alert => 
    new Date(alert.timestamp) > thirtyDaysAgo
  );
  
  localStorage.setItem('safeguard_emergency_alerts', JSON.stringify(filteredAlerts));
}

// Format timestamp for display
export function formatAlertTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

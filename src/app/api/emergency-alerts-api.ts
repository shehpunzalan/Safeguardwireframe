import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c840a992`;

export interface EmergencyAlert {
  id: string;
  elderlyUserId: string;
  elderlyName: string;
  elderlyPhone: string;
  elderlyEmail?: string;
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
  familyMemberIds: string[];
  readBy: string[];
}

// Helper to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Create a new emergency alert
export async function createEmergencyAlert(
  elderlyUserId: string,
  elderlyName: string,
  elderlyPhone: string,
  elderlyEmail: string,
  location?: { latitude: number; longitude: number; address: string },
  medicalInfo?: { bloodType?: string; allergies?: string; medicalConditions?: string; currentMedications?: string }
): Promise<EmergencyAlert> {
  const result = await apiRequest('/alerts/create', {
    method: 'POST',
    body: JSON.stringify({
      elderlyUserId,
      elderlyName,
      elderlyPhone,
      elderlyEmail,
      location,
      medicalInfo,
    }),
  });
  return result.alert;
}

// Get all alerts for a family member
export async function getAlertsForFamilyMember(familyMemberId: string): Promise<EmergencyAlert[]> {
  const result = await apiRequest(`/alerts/family/${encodeURIComponent(familyMemberId)}`);
  return result.alerts;
}

// Get active alerts for a family member
export async function getActiveAlertsForFamilyMember(familyMemberId: string): Promise<EmergencyAlert[]> {
  const result = await apiRequest(`/alerts/family/${encodeURIComponent(familyMemberId)}/active`);
  return result.alerts;
}

// Get unread alert count
export async function getUnreadAlertCount(familyMemberId: string): Promise<number> {
  const result = await apiRequest(`/alerts/family/${encodeURIComponent(familyMemberId)}/unread-count`);
  return result.count;
}

// Get a specific alert
export async function getAlert(alertId: string): Promise<EmergencyAlert> {
  const result = await apiRequest(`/alerts/${encodeURIComponent(alertId)}`);
  return result.alert;
}

// Update alert status
export async function updateAlertStatus(
  alertId: string,
  status: 'active' | 'resolved' | 'cancelled'
): Promise<EmergencyAlert> {
  const result = await apiRequest(`/alerts/${encodeURIComponent(alertId)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return result.alert;
}

// Mark alert as read
export async function markAlertAsRead(alertId: string, familyMemberId: string): Promise<EmergencyAlert> {
  const result = await apiRequest(`/alerts/${encodeURIComponent(alertId)}/read`, {
    method: 'POST',
    body: JSON.stringify({ familyMemberId }),
  });
  return result.alert;
}

// Link family member to elderly user
export async function linkFamilyMember(elderlyPhone: string, familyPhone: string): Promise<void> {
  await apiRequest('/alerts/link-family', {
    method: 'POST',
    body: JSON.stringify({ elderlyPhone, familyPhone }),
  });
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

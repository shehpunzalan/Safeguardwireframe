import * as kv from './kv_store.tsx';

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

const ALERT_PREFIX = 'emergency_alert:';
const USER_ALERTS_PREFIX = 'user_alerts:';

// Create a new emergency alert
export async function createEmergencyAlert(
  elderlyUserId: string,
  elderlyName: string,
  elderlyPhone: string,
  elderlyEmail: string,
  location?: { latitude: number; longitude: number; address: string },
  medicalInfo?: { bloodType?: string; allergies?: string; medicalConditions?: string; currentMedications?: string }
): Promise<EmergencyAlert> {
  const alertId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get elderly user's linked family members
  const familyMemberIds = await getFamilyMembers(elderlyUserId);
  
  const alert: EmergencyAlert = {
    id: alertId,
    elderlyUserId,
    elderlyName,
    elderlyPhone,
    elderlyEmail,
    timestamp: new Date().toISOString(),
    status: 'active',
    location,
    medicalInfo,
    familyMemberIds,
    readBy: []
  };
  
  // Store the alert
  await kv.set(`${ALERT_PREFIX}${alertId}`, JSON.stringify(alert));
  
  // Add alert reference to each family member's alert list
  for (const familyId of familyMemberIds) {
    const userAlertsKey = `${USER_ALERTS_PREFIX}${familyId}`;
    const existingAlerts = await kv.get(userAlertsKey);
    const alertIds = existingAlerts ? JSON.parse(existingAlerts) : [];
    alertIds.unshift(alertId); // Add to beginning
    await kv.set(userAlertsKey, JSON.stringify(alertIds));
  }
  
  return alert;
}

// Get all alerts for a family member
export async function getAlertsForFamilyMember(familyMemberId: string): Promise<EmergencyAlert[]> {
  const userAlertsKey = `${USER_ALERTS_PREFIX}${familyMemberId}`;
  const alertIdsJson = await kv.get(userAlertsKey);
  
  if (!alertIdsJson) {
    return [];
  }
  
  const alertIds: string[] = JSON.parse(alertIdsJson);
  const alerts: EmergencyAlert[] = [];
  
  for (const alertId of alertIds) {
    const alertJson = await kv.get(`${ALERT_PREFIX}${alertId}`);
    if (alertJson) {
      alerts.push(JSON.parse(alertJson));
    }
  }
  
  return alerts;
}

// Get active alerts for a family member
export async function getActiveAlertsForFamilyMember(familyMemberId: string): Promise<EmergencyAlert[]> {
  const allAlerts = await getAlertsForFamilyMember(familyMemberId);
  return allAlerts.filter(alert => alert.status === 'active');
}

// Get a specific alert
export async function getAlert(alertId: string): Promise<EmergencyAlert | null> {
  const alertJson = await kv.get(`${ALERT_PREFIX}${alertId}`);
  return alertJson ? JSON.parse(alertJson) : null;
}

// Update alert status
export async function updateAlertStatus(
  alertId: string,
  status: 'active' | 'resolved' | 'cancelled'
): Promise<EmergencyAlert | null> {
  const alertJson = await kv.get(`${ALERT_PREFIX}${alertId}`);
  if (!alertJson) {
    return null;
  }
  
  const alert: EmergencyAlert = JSON.parse(alertJson);
  alert.status = status;
  
  await kv.set(`${ALERT_PREFIX}${alertId}`, JSON.stringify(alert));
  return alert;
}

// Mark alert as read by a family member
export async function markAlertAsRead(alertId: string, familyMemberId: string): Promise<EmergencyAlert | null> {
  const alertJson = await kv.get(`${ALERT_PREFIX}${alertId}`);
  if (!alertJson) {
    return null;
  }
  
  const alert: EmergencyAlert = JSON.parse(alertJson);
  
  if (!alert.readBy.includes(familyMemberId)) {
    alert.readBy.push(familyMemberId);
    await kv.set(`${ALERT_PREFIX}${alertId}`, JSON.stringify(alert));
  }
  
  return alert;
}

// Get unread alert count for a family member
export async function getUnreadAlertCount(familyMemberId: string): Promise<number> {
  const alerts = await getActiveAlertsForFamilyMember(familyMemberId);
  return alerts.filter(alert => !alert.readBy.includes(familyMemberId)).length;
}

// Helper: Get family members linked to an elderly user
async function getFamilyMembers(elderlyUserId: string): Promise<string[]> {
  const linkKey = `family_link:${elderlyUserId}`;
  const linkJson = await kv.get(linkKey);
  
  if (!linkJson) {
    // If no explicit links, return empty array
    // In a real system, you'd have a proper user relationship table
    return [];
  }
  
  return JSON.parse(linkJson);
}

// Link a family member to an elderly user (for setup)
export async function linkFamilyMember(elderlyUserId: string, familyMemberId: string): Promise<void> {
  const linkKey = `family_link:${elderlyUserId}`;
  const linkJson = await kv.get(linkKey);
  
  const familyMembers = linkJson ? JSON.parse(linkJson) : [];
  
  if (!familyMembers.includes(familyMemberId)) {
    familyMembers.push(familyMemberId);
    await kv.set(linkKey, JSON.stringify(familyMembers));
  }
}

// For demo purposes: Link by phone number or email
export async function linkFamilyMemberByContact(
  elderlyPhone: string,
  familyPhone: string
): Promise<boolean> {
  // In production, you'd look up actual user IDs
  // For demo, we'll use phone numbers as IDs
  const elderlyUserId = `user:${elderlyPhone}`;
  const familyUserId = `user:${familyPhone}`;
  
  await linkFamilyMember(elderlyUserId, familyUserId);
  return true;
}

// Clean up old alerts (older than 30 days)
export async function cleanOldAlerts(): Promise<number> {
  const allAlertKeys = await kv.getByPrefix(ALERT_PREFIX);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let deletedCount = 0;
  
  for (const key of allAlertKeys.map(a => a.key)) {
    const alertJson = await kv.get(key);
    if (alertJson) {
      const alert: EmergencyAlert = JSON.parse(alertJson);
      if (new Date(alert.timestamp) < thirtyDaysAgo) {
        await kv.del(key);
        deletedCount++;
      }
    }
  }
  
  return deletedCount;
}

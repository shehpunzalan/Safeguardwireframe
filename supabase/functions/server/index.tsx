import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as emergencyAlerts from "./emergency-alerts.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c840a992/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= EMERGENCY ALERT ENDPOINTS =============

// Create a new emergency alert (triggered by elderly user)
app.post("/make-server-c840a992/alerts/create", async (c) => {
  try {
    const body = await c.req.json();
    const { elderlyUserId, elderlyName, elderlyPhone, elderlyEmail, location, medicalInfo } = body;
    
    if (!elderlyUserId || !elderlyName || !elderlyPhone) {
      return c.json({ error: "Missing required fields: elderlyUserId, elderlyName, elderlyPhone" }, 400);
    }
    
    const alert = await emergencyAlerts.createEmergencyAlert(
      elderlyUserId,
      elderlyName,
      elderlyPhone,
      elderlyEmail,
      location,
      medicalInfo
    );
    
    console.log(`Emergency alert created: ${alert.id} for ${elderlyName}`);
    return c.json({ success: true, alert });
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    return c.json({ error: "Failed to create emergency alert", details: error.message }, 500);
  }
});

// Get all alerts for a family member
app.get("/make-server-c840a992/alerts/family/:familyMemberId", async (c) => {
  try {
    const familyMemberId = c.req.param("familyMemberId");
    const alerts = await emergencyAlerts.getAlertsForFamilyMember(familyMemberId);
    
    return c.json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching alerts for family member:", error);
    return c.json({ error: "Failed to fetch alerts", details: error.message }, 500);
  }
});

// Get active alerts for a family member
app.get("/make-server-c840a992/alerts/family/:familyMemberId/active", async (c) => {
  try {
    const familyMemberId = c.req.param("familyMemberId");
    const alerts = await emergencyAlerts.getActiveAlertsForFamilyMember(familyMemberId);
    
    return c.json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    return c.json({ error: "Failed to fetch active alerts", details: error.message }, 500);
  }
});

// Get unread alert count
app.get("/make-server-c840a992/alerts/family/:familyMemberId/unread-count", async (c) => {
  try {
    const familyMemberId = c.req.param("familyMemberId");
    const count = await emergencyAlerts.getUnreadAlertCount(familyMemberId);
    
    return c.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return c.json({ error: "Failed to fetch unread count", details: error.message }, 500);
  }
});

// Get a specific alert
app.get("/make-server-c840a992/alerts/:alertId", async (c) => {
  try {
    const alertId = c.req.param("alertId");
    const alert = await emergencyAlerts.getAlert(alertId);
    
    if (!alert) {
      return c.json({ error: "Alert not found" }, 404);
    }
    
    return c.json({ success: true, alert });
  } catch (error) {
    console.error("Error fetching alert:", error);
    return c.json({ error: "Failed to fetch alert", details: error.message }, 500);
  }
});

// Update alert status
app.put("/make-server-c840a992/alerts/:alertId/status", async (c) => {
  try {
    const alertId = c.req.param("alertId");
    const body = await c.req.json();
    const { status } = body;
    
    if (!['active', 'resolved', 'cancelled'].includes(status)) {
      return c.json({ error: "Invalid status. Must be: active, resolved, or cancelled" }, 400);
    }
    
    const alert = await emergencyAlerts.updateAlertStatus(alertId, status);
    
    if (!alert) {
      return c.json({ error: "Alert not found" }, 404);
    }
    
    console.log(`Alert ${alertId} status updated to: ${status}`);
    return c.json({ success: true, alert });
  } catch (error) {
    console.error("Error updating alert status:", error);
    return c.json({ error: "Failed to update alert status", details: error.message }, 500);
  }
});

// Mark alert as read
app.post("/make-server-c840a992/alerts/:alertId/read", async (c) => {
  try {
    const alertId = c.req.param("alertId");
    const body = await c.req.json();
    const { familyMemberId } = body;
    
    if (!familyMemberId) {
      return c.json({ error: "Missing familyMemberId" }, 400);
    }
    
    const alert = await emergencyAlerts.markAlertAsRead(alertId, familyMemberId);
    
    if (!alert) {
      return c.json({ error: "Alert not found" }, 404);
    }
    
    return c.json({ success: true, alert });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    return c.json({ error: "Failed to mark alert as read", details: error.message }, 500);
  }
});

// Link family member to elderly user
app.post("/make-server-c840a992/alerts/link-family", async (c) => {
  try {
    const body = await c.req.json();
    const { elderlyPhone, familyPhone } = body;
    
    if (!elderlyPhone || !familyPhone) {
      return c.json({ error: "Missing elderlyPhone or familyPhone" }, 400);
    }
    
    await emergencyAlerts.linkFamilyMemberByContact(elderlyPhone, familyPhone);
    
    console.log(`Linked family member ${familyPhone} to elderly user ${elderlyPhone}`);
    return c.json({ success: true, message: "Family member linked successfully" });
  } catch (error) {
    console.error("Error linking family member:", error);
    return c.json({ error: "Failed to link family member", details: error.message }, 500);
  }
});

// Clean old alerts (can be called periodically)
app.post("/make-server-c840a992/alerts/cleanup", async (c) => {
  try {
    const deletedCount = await emergencyAlerts.cleanOldAlerts();
    
    console.log(`Cleaned up ${deletedCount} old alerts`);
    return c.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Error cleaning old alerts:", error);
    return c.json({ error: "Failed to clean old alerts", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);
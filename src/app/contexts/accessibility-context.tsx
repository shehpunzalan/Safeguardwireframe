import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilitySettings {
  textSize: number;
  largeText: boolean;
  highContrast: boolean;
  voiceCommands: boolean;
  pushNotifications: boolean;
  language: string;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  speak: (text: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 16,
  largeText: false,
  highContrast: false,
  voiceCommands: false,
  pushNotifications: true,
  language: "English",
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("safeguard_accessibility");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("safeguard_accessibility", JSON.stringify(settings));
    
    // Apply settings to document
    applySettings(settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const speak = (text: string) => {
    if (!settings.voiceCommands) return;
    
    // Use Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elderly users
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

// Apply settings to the document
function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  
  // Apply text size
  if (settings.largeText) {
    root.style.fontSize = `${settings.textSize + 4}px`;
  } else {
    root.style.fontSize = `${settings.textSize}px`;
  }
  
  // Apply high contrast
  if (settings.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }
}

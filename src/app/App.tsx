import { useState, useEffect } from "react";
import { LoginScreen } from "@/app/components/login-screen";
import { CreateAccountScreen } from "@/app/components/create-account-screen";
import { DashboardScreen } from "@/app/components/dashboard-screen";
import { SettingsScreen } from "@/app/components/settings-screen";
import { EditProfileScreen, ProfileData } from "@/app/components/edit-profile-screen";
import { EmergencyAlertScreen } from "@/app/components/emergency-alert-screen";
import { AccessibilityProvider } from "@/app/contexts/accessibility-context";
import { PWAInstallPrompt } from "@/app/components/pwa-install-prompt";
import { PWAStatus } from "@/app/components/pwa-status";
import { FamilyLinkSetup } from "@/app/components/family-link-setup";

type Screen = "login" | "create-account" | "dashboard" | "settings" | "edit-profile" | "emergency-alert" | "family-link-setup";

interface User {
  fullName: string;
  phoneNumber: string;
  email: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  pin: string;
  userType: "elderly" | "family";
  address?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  emergencyContactRelationship?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState("");

  // Load accounts from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("safeguard_current_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setCurrentScreen("dashboard");
    }
  }, []);

  const handleLogin = (phoneNumber: string, pin: string, userType: "elderly" | "family") => {
    // Get all accounts from localStorage
    const accountsJson = localStorage.getItem("safeguard_accounts");
    const accounts: User[] = accountsJson ? JSON.parse(accountsJson) : [];

    // Find matching account
    const account = accounts.find(
      (acc) => acc.phoneNumber === phoneNumber && acc.pin === pin && acc.userType === userType
    );

    if (account) {
      setCurrentUser(account);
      localStorage.setItem("safeguard_current_user", JSON.stringify(account));
      
      // Check if family member needs to complete setup
      if (userType === "family") {
        const setupDone = localStorage.getItem('safeguard_family_link_setup_done');
        const setupSkipped = localStorage.getItem('safeguard_family_link_setup_skipped');
        
        if (!setupDone && !setupSkipped) {
          setCurrentScreen("family-link-setup");
          setLoginError("");
          return;
        }
      }
      
      setCurrentScreen("dashboard");
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Please try again or create an account.");
      setTimeout(() => setLoginError(""), 3000);
    }
  };

  const handleCreateAccount = (userData: User) => {
    // Get existing accounts
    const accountsJson = localStorage.getItem("safeguard_accounts");
    const accounts: User[] = accountsJson ? JSON.parse(accountsJson) : [];

    // Check if phone number already exists
    const existingAccount = accounts.find((acc) => acc.phoneNumber === userData.phoneNumber);
    if (existingAccount) {
      alert("An account with this phone number already exists.");
      return;
    }

    // Add new account
    accounts.push(userData);
    localStorage.setItem("safeguard_accounts", JSON.stringify(accounts));

    // Set as current user
    setCurrentUser(userData);
    localStorage.setItem("safeguard_current_user", JSON.stringify(userData));
    setCurrentScreen("dashboard");
  };

  const handleSaveProfile = (profileData: ProfileData) => {
    if (!currentUser) return;

    // Update current user with profile data
    const updatedUser: User = {
      ...currentUser,
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber,
      email: profileData.email,
      address: profileData.address,
      bloodType: profileData.bloodType,
      allergies: profileData.allergies,
      medicalConditions: profileData.medicalConditions,
      currentMedications: profileData.currentMedications,
      emergencyContactName: profileData.emergencyContactName,
      emergencyContactPhone: profileData.emergencyContactPhone,
      emergencyContactRelationship: profileData.emergencyContactRelationship,
    };

    // Update in localStorage
    const accountsJson = localStorage.getItem("safeguard_accounts");
    const accounts: User[] = accountsJson ? JSON.parse(accountsJson) : [];
    const updatedAccounts = accounts.map((acc) =>
      acc.phoneNumber === currentUser.phoneNumber ? updatedUser : acc
    );
    localStorage.setItem("safeguard_accounts", JSON.stringify(updatedAccounts));
    localStorage.setItem("safeguard_current_user", JSON.stringify(updatedUser));

    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("safeguard_current_user");
    setCurrentScreen("login");
  };

  return (
    <AccessibilityProvider>
      <div className="size-full">
        {currentScreen === "login" && (
          <LoginScreen
            onLogin={handleLogin}
            onCreateAccount={() => setCurrentScreen("create-account")}
          />
        )}
        {currentScreen === "create-account" && (
          <CreateAccountScreen
            onCreateAccount={handleCreateAccount}
            onBack={() => setCurrentScreen("login")}
            onLogin={() => setCurrentScreen("login")}
          />
        )}
        {currentScreen === "dashboard" && currentUser && (
          <DashboardScreen
            userName={currentUser.fullName}
            userType={currentUser.userType}
            onLogout={handleLogout}
            onSettings={() => setCurrentScreen("settings")}
            onEmergencyAlert={() => setCurrentScreen("emergency-alert")}
          />
        )}
        {currentScreen === "settings" && (
          <SettingsScreen
            onBack={() => setCurrentScreen("dashboard")}
            onEditProfile={() => setCurrentScreen("edit-profile")}
            currentUser={currentUser}
          />
        )}
        {currentScreen === "edit-profile" && currentUser && (
          <EditProfileScreen
            onBack={() => setCurrentScreen("settings")}
            onSave={handleSaveProfile}
            initialData={{
              fullName: currentUser.fullName,
              phoneNumber: currentUser.phoneNumber,
              email: currentUser.email,
              address: currentUser.address || "123 Oak Street, Springfield, IL 62701",
              bloodType: currentUser.bloodType,
              allergies: currentUser.allergies || "Penicillin, Latex",
              medicalConditions: currentUser.medicalConditions || "High Blood Pressure, Type 2 Diabetes",
              currentMedications: currentUser.currentMedications || "Lisinopril 10mg (daily), Metformin 500mg (twice daily)",
              emergencyContactName: currentUser.emergencyContactName,
              emergencyContactPhone: currentUser.emergencyContactPhone,
              emergencyContactRelationship: currentUser.emergencyContactRelationship || "Daughter",
            }}
          />
        )}
        {currentScreen === "emergency-alert" && currentUser && (
          <EmergencyAlertScreen
            elderlyUserName="John Doe"
            elderlyAge={72}
            elderlyPhone="+1 (555) 123-4567"
            elderlyEmail="john.doe@example.com"
            elderlyAddress="123 Oak Street, Springfield, IL 62701"
            bloodType="O+"
            allergies={["Penicillin", "Latex"]}
            medicalConditions={["Diabetes Type 2", "Arrhythmia", "High Blood Pressure"]}
            medications={["Lisinopril 10mg (daily)", "Metformin 500mg (twice daily)"]}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )}
        {currentScreen === "family-link-setup" && currentUser && (
          <FamilyLinkSetup
            familyPhone={currentUser.phoneNumber}
            onComplete={() => setCurrentScreen("dashboard")}
            onSkip={() => setCurrentScreen("dashboard")}
          />
        )}
        
        {/* Error Toast */}
        {loginError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            {loginError}
          </div>
        )}
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
        <PWAStatus />
      </div>
    </AccessibilityProvider>
  );
}
import { createBrowserRouter, Navigate } from "react-router";
import SplashScreen from "./components/SplashScreen";
import Screen1Welcome from "./components/Screen1Welcome";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import SignupMethodScreen from "./components/SignupMethodScreen";
import SelfSignupScreen from "./components/SelfSignupScreen";
import SignupTermsScreen from "./components/SignupTermsScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import PasswordResetScreen from "./components/PasswordResetScreen";
import OnboardingStep1 from "./components/OnboardingStep1";
import OnboardingStep2 from "./components/OnboardingStep2";
import OnboardingStep3 from "./components/OnboardingStep3";
import OnboardingStep4 from "./components/OnboardingStep4";
import HomeScreen from "./components/HomeScreen";
import HealthReport from "./components/HealthReport";
import Screen5InsuranceClaim from "./components/Screen5InsuranceClaim";
import Screen6PremiumChange from "./components/Screen6PremiumChange";
import MedicalUploadScreen from "./components/MedicalUploadScreen";
import MedicalRecordsScreen from "./components/MedicalRecordsScreen";
import WalkScreen from "./components/WalkScreen";
import RecordHubScreen from "./components/RecordHubScreen";
import MealLogScreen from "./components/MealLogScreen";
import HealthLogScreen from "./components/HealthLogScreen";
import PetProfileScreen from "./components/PetProfileScreen";
import PetEditScreen from "./components/PetEditScreen";
import PetSwitchScreen from "./components/PetSwitchScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import SettingsScreen from "./components/SettingsScreen";

export const router = createBrowserRouter([
  { path: "/", Component: SplashScreen },
  { path: "/welcome", Component: Screen1Welcome },
  { path: "/login", Component: LoginScreen },
  { path: "/signup", Component: SignupMethodScreen },
  { path: "/signup/self", Component: SelfSignupScreen },
  { path: "/signup/terms", Component: SignupTermsScreen },
  { path: "/forgot-password", Component: ForgotPasswordScreen },
  { path: "/password-reset", Component: PasswordResetScreen },
  { path: "/onboarding/1", Component: OnboardingStep1 },
  { path: "/onboarding/2", Component: OnboardingStep2 },
  { path: "/onboarding/3", Component: OnboardingStep3 },
  { path: "/onboarding/4", Component: OnboardingStep4 },
  { path: "/home", Component: HomeScreen },
  { path: "/report", Component: HealthReport },
  { path: "/lifestyle", Component: Screen5InsuranceClaim },
  { path: "/trends", Component: Screen6PremiumChange },
  { path: "/medical-upload", Component: MedicalUploadScreen },
  { path: "/medical-records", Component: MedicalRecordsScreen },
  { path: "/walk", Component: WalkScreen },
  { path: "/record", Component: RecordHubScreen },
  { path: "/record/meal", Component: MealLogScreen },
  { path: "/record/health", Component: HealthLogScreen },
  { path: "/profile", Component: PetProfileScreen },
  { path: "/profile/edit", Component: PetEditScreen },
  { path: "/profile/switch", Component: PetSwitchScreen },
  { path: "/notifications", Component: NotificationsScreen },
  { path: "/settings", Component: SettingsScreen },
  { path: "*", element: <Navigate to="/" replace /> },
]);
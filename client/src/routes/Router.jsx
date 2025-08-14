// routes/Router.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/Volunteer/LoginPage";
import RegisterUserPage from "../pages/User/RegisterUserPage";
import RegisterVolunteerPage from "../pages/Volunteer/RegisterVolunteerPage";
import EmergencyPage from "../pages/Call/EmergencyPage";
import CreateCallPage from "../pages/Call/CreateCallPage";
import CallConfirmationPage from "../pages/Call/CallConfirmationPage";
import VolunteerPage from "../pages/Volunteer/volunteerPage";
import VolunteerListPage from "../pages/Volunteer/VolunteerListPage";
import VolunteerUpdatePage from "../pages/Volunteer/VolunteerUpdatePage";
import ActiveCallsPage from "../pages/Volunteer/VolunteerActiveCallsPage";
import HistoryPage from "../pages/Volunteer/VolunteerCallHistoryPage";
import AuthRedirector from "../components/AuthRedirector";
import VolunteerMenu from "../pages/Volunteer/volunteerPage";
import MyCallsPage from "../pages/Call/MyCallsPage";
import CallWatcher from "../components/CallWatcher";
import NotificationDebugPanel from "../components/NotificationDebugPanel";
import PageLayout from "../layouts/PageLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRedirector />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/user/register",
    element: <RegisterUserPage />,
  },
  {
    path: "/volunteer/register", 
    element: <RegisterVolunteerPage />,
  },
  {
    path: "/register-user",
    element: <RegisterUserPage />,
  },
  {
    path: "/register-volunteer",
    element: <RegisterVolunteerPage />,
  },
  {
    path: "/create-call",
    element: <EmergencyPage />,
  },
  {
    path: "/CreateCallPage",
    element: <CreateCallPage />,
  },
  {
    path: "/call-confirmation/:callId",
    element: <CallConfirmationPage />,
  },
  {
    path: "/volunteerPage",
    element: <PageLayout><VolunteerPage /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "/VolunteerListPage",
    element: <PageLayout><VolunteerListPage /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "/volunteer/update-details",
    element: <PageLayout><VolunteerUpdatePage /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "/volunteer/active-calls",
    element: <PageLayout><ActiveCallsPage /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "/volunteer/history",
    element: <PageLayout><HistoryPage /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "/volunteer/menu",
    element: <PageLayout><VolunteerMenu /><NotificationDebugPanel /></PageLayout>,
  },
  {
    path: "*",
    element: <h1>404 - Page Not Found</h1>,
  },
  {
    path: "/my-calls",
    element: <PageLayout><MyCallsPage /><NotificationDebugPanel /></PageLayout>,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

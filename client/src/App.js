import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./layouts/Login";
import Register from "./layouts/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Homepage from "./pages/homepage";
import Renter from "./pages/Renter";
import SendNotificationPage from "./pages/SendNotificationPage";
import TenantDashboardPage from "./pages/TenantDashboardPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/homepage" element={<Homepage />} />
              <Route path="/room/:roomId/tenants" element={<Renter />} />
              
              <Route path="/notifications/send" element={<SendNotificationPage />} />
        <Route path="/tenant/notifications" element={<TenantDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

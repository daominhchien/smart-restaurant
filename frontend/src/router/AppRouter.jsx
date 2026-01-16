import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import NotFoundPage from "../pages/auth/NotFoundPage";
import Unauthorized from "../pages/auth/Unauthorized";
import QrError from "../pages/guest/QrError";

import SuperAdminRoutes from "./roles/SuperAdminRoutes";
import TenantAdminRoutes from "./roles/TenantAdminRoutes";
import GuestRoutes from "./roles/GuestRoutes";
import WaiterRoutes from "./roles/WaiterRoutes";
import KitchenRoutes from "./roles/KitchenRoutes";

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Role based routes */}
      {SuperAdminRoutes()}
      {TenantAdminRoutes()}
      {GuestRoutes()}
      {WaiterRoutes()}
      {KitchenRoutes()}

      {/* QR Error */}
      <Route path="/qr/error" element={<QrError />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

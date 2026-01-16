import { Route } from "react-router-dom";
import RoleRoute from "../RoleRoute";
import AdminLayout from "../../components/layout/AdminLayout";

import Dashboard from "../../pages/admin/Dashboard";
import TableManagement from "../../pages/admin/TableManagement";
import RegisterInforTenant from "../../pages/admin/RegisterInforTenant";
import MenuManagement from "../../pages/admin/MenuManagement";
import StaffManagement from "../../pages/admin/StaffManagement";

export default function TenantAdminRoutes() {
  return (
    <Route
      path="/tenant-admin"
      element={
        <RoleRoute allowedRoles={["TENANT_ADMIN"]}>
          <AdminLayout />
        </RoleRoute>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="table-management" element={<TableManagement />} />
      <Route path="tenant-create" element={<RegisterInforTenant />} />
      <Route path="menu-management" element={<MenuManagement />} />
      <Route path="staff-management" element={<StaffManagement />} />
    </Route>
  );
}

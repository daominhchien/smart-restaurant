import { Route } from "react-router-dom";
import RoleRoute from "../RoleRoute";
import SuperAdminLayout from "../../components/layout/SuperAdminLayout";
import AccountManagement from "../../pages/super-admin/AccountManagement";

export default function SuperAdminRoutes() {
  return (
    <Route
      path="/super-admin"
      element={
        <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
          <SuperAdminLayout />
        </RoleRoute>
      }
    >
      <Route path="accounts" element={<AccountManagement />} />
    </Route>
  );
}

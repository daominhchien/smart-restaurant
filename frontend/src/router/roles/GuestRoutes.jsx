import { Route } from "react-router-dom";
import GuestLayout from "../../components/layout/GuestLayout";
import Menu from "../../pages/guest/Menu";

export default function GuestRoutes() {
  return (
    <Route path="/guest" element={<GuestLayout />}>
      <Route path="menu/:tenantId/tables/:tableId" element={<Menu />} />
    </Route>
  );
}

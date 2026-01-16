import { Route } from "react-router-dom";
import RoleRoute from "../RoleRoute";
import DisplayKDS from "../../pages/kitchen-staff/DisplayKDS";

export default function KitchenRoutes() {
  return (
    <Route
      path="/kitchen"
      element={
        <RoleRoute allowedRoles={["KITCHEN_STAFF"]}>
          {/* có layout thì thay bằng <KitchenLayout /> */}
          <DisplayKDS />
        </RoleRoute>
      }
    >
      <Route path="kds" element={<DisplayKDS />} />
    </Route>
  );
}

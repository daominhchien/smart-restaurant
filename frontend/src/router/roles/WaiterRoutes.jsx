import { Route } from "react-router-dom";
import WaiterDashboard from "../../pages/waiter/Dashboard";

export default function WaiterRoutes() {
  return (
    <Route path="/waiter">
      <Route path="dashboard" element={<WaiterDashboard />} />
    </Route>
  );
}

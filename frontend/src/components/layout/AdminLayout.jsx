import Navigation from "../common/Navigation";
import { Outlet } from "react-router";
function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navigation />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

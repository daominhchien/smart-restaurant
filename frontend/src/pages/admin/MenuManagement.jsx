import CategoryManagementCard from "../../components/admin/CategoryManagementCard";
import ItemManagementCard from "../../components/admin/ItemManagementCard";
import ModifierManagement from "../../components/admin/ModifierManagement";
function MenuManagement() {
  return (
    <div className="col-start-2 col-end-12 space-y-6 py-6">
      {/* Quản lý category */}
      <CategoryManagementCard />

      {/* Tùy chọn của item */}
      <ModifierManagement />

      {/* Quản lý item */}
      <ItemManagementCard />
      <></>
    </div>
  );
}

export default MenuManagement;

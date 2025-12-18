import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CreateTableDialog({ onClose }) {
  const [formData, setFormData] = useState({
    table_name: "",
    section: "Indoor",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      table_name: "",
      section: "Indoor",
      is_active: true,
    });
  };

  useEffect(() => {
    resetForm();
  }, []);

  const handleCreate = () => {
    if (!formData.table_name.trim()) {
      toast.error("Vui lòng nhập tên bàn");
      return;
    }

    const newTable = {
      table_id: Date.now().toString(),
      table_name: formData.table_name,
      section: formData.section,
      is_active: formData.is_active,
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
      qr_history: [
        {
          qr_id: `QR${Date.now()}`,
          qr_url: `https://restaurant.com/menu?table=${Date.now()}`,
          is_active: true,
          created_at: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString().split("T")[0],
        },
      ],
    };

    console.log("NEW TABLE:", newTable); // sau này gọi API

    toast.success("Tạo mới bàn thành công");
    onClose();
    resetForm();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Tạo bàn mới</h2>

        <div className="space-y-4">
          {/* Tên bàn */}
          <div>
            <label className="text-sm font-medium">Tên bàn *</label>
            <input
              value={formData.table_name}
              onChange={(e) =>
                setFormData({ ...formData, table_name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="VD: Bàn 01"
            />
          </div>

          {/* Section */}
          <div>
            <label className="text-sm font-medium">Khu vực *</label>
            <select
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Patio">Patio</option>
              <option value="VIP Room">VIP Room</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Trạng thái *</label>
            <select
              value={formData.is_active ? "active" : "inactive"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "active",
                })
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-400 rounded-md py-2 text-sm cursor-pointer hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 bg-gray-900 text-white rounded-md py-2 text-sm cursor-pointer hover:opacity-90"
          >
            Tạo bàn
          </button>
        </div>
      </div>
    </>
  );
}

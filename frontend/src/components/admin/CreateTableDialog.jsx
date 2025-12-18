import { useEffect } from "react";
import toast from "react-hot-toast";

export default function CreateTableDialog({ formData, setFormData, onClose }) {
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

  // ✅ Giả lập API tạo bàn theo ERD
  const handleCreate = () => {
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
          qr_url: `https://restaurant.com/menu?table=${Date.now()}&token=${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          is_active: true,
          created_at: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString().split("T")[0],
        },
      ],
    };

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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tạo bàn mới
        </h2>

        <div className="space-y-4">
          {/* Tên bàn */}
          <div className="space-y-2">
            <label
              htmlFor="table_name"
              className="text-sm font-medium text-gray-700"
            >
              Tên bàn *
            </label>
            <input
              id="table_name"
              type="text"
              placeholder="VD: Bàn 01, VIP-01"
              value={formData.table_name}
              onChange={(e) =>
                setFormData({ ...formData, table_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
          </div>

          {/* Khu vực (section) */}
          <div className="space-y-2">
            <label
              htmlFor="section"
              className="text-sm font-medium text-gray-700"
            >
              Khu vực *
            </label>
            <select
              id="section"
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Patio">Patio</option>
              <option value="VIP Room">VIP Room</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Trạng thái *
            </label>
            <select
              id="is_active"
              value={formData.is_active ? "active" : "inactive"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "active",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
          >
            Tạo bàn
          </button>
        </div>
      </div>
    </>
  );
}

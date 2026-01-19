// ============================================
// CustomerInfoModal.jsx
// ============================================
import { X, User, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import Overlay from "../common/Overlay";

export default function CustomerInfoModal({ onSuccess, onClose }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phone || !address) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // 📤 GỬI API CẬP NHẬT THÔNG TIN KHÁCH HÀNG
      const res = await authApi.updateCustomerInfo({
        fullName,
        phone,
        address,
      });

      console.log(res);

      if (res?.code === 1000) {
        // ✅ CẬP NHẬT THÀNH CÔNG
        onSuccess?.();
      } else {
        throw new Error("Cập nhật thông tin thất bại");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      {/* MODAL */}
      <div className="p-6 w-[92%] max-w-md bg-white rounded-3xl shadow-xl animate-scaleIn sm:p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
            Cập nhật thông tin
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 px-4 py-3 text-red-600 text-sm bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-4">
          {/* FULL NAME */}
          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* PHONE */}
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* ADDRESS */}
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-3 w-full text-white font-semibold bg-green-600 rounded-2xl hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Xác nhận"}
          </button>
        </div>

        {/* INFO */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Thông tin này là bắt buộc để hoàn thành đăng ký
        </p>
      </div>
    </Overlay>
  );
}

// ============================================
// LoginModal.jsx
// ============================================
import { X, Mail, Lock } from "lucide-react";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import authApi from "../../api/authApi";
import Overlay from "../common/Overlay";
import CustomerInfoModal from "./CustomerInfoModal.jsx";

export default function LoginModal({
  onClose,
  tenantId,
  onSuccess,
  onRegisterModal,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({
        userName: email,
        password,
      });

      console.log(res);

      const accessToken = res?.result?.acessToken;
      const firstActivity = res?.result?.firstActivity;
      const userName = email;

      if (!accessToken) {
        throw new Error("Đăng nhập thất bại");
      }

      // 🔐 LƯU GIỐNG LOGIN PAGE
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("userName", userName);

      // 🔄 CẬP NHẬT AUTH CONTEXT
      await login(accessToken);

      const role = localStorage.getItem("role");

      // ✅ KIỂM TRA FIRST ACTIVITY
      if (firstActivity) {
        // Hiển thị modal nhập thông tin khách hàng
        setShowCustomerInfo(true);
      } else {
        // Đăng nhập bình thường
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Email hoặc mật khẩu không chính xác",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoSuccess = () => {
    setShowCustomerInfo(false);
    onClose();
    onSuccess?.();
  };

  const handleCustomerInfoClose = () => {
    setShowCustomerInfo(false);
    onClose();
  };

  // Nếu đang hiển thị modal nhập thông tin khách hàng
  if (showCustomerInfo) {
    return (
      <CustomerInfoModal
        onSuccess={handleCustomerInfoSuccess}
        onClose={handleCustomerInfoClose}
      />
    );
  }

  return (
    <Overlay>
      {/* MODAL */}
      <div className="p-6 w-[92%] max-w-md bg-white rounded-3xl shadow-xl animate-scaleIn sm:p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
            Đăng nhập
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
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
          {/* EMAIL */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-3 w-full text-white font-semibold bg-blue-600 rounded-2xl hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => {
              onRegisterModal();
            }}
            className="text-green-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </Overlay>
  );
}

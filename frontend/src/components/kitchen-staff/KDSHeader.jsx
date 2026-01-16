import { useEffect, useState, useContext } from "react";
import { ChefHat, RefreshCw, LogOut } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";

function KDSHeader({ onRefresh, loading }) {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout API failed:", error);
    } finally {
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center max-w-full">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg">
              <ChefHat size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                MÀN HÌNH ĐẦU BẾP
              </h1>
              <p className="text-xs text-gray-500">Kitchen Display System</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col leading-tight text-right">
                <span className="font-semibold text-sm text-gray-900">
                  {userName}
                </span>
                <span className="text-xs text-gray-500">
                  {role === "SUPER_ADMIN" ? "Quản trị viên" : role}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {userName ? userName.charAt(0).toUpperCase() : "👤"}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-semibold text-sm transition-all"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default KDSHeader;

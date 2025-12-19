import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import authApi from "../../api/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await authApi.login({
        userName: email,
        password: password,
      });
      console.log(res);
      localStorage.setItem("userName", email);
      const accessToken = res.result.acessToken;

      // login vào context (context tự lo decode + lưu)
      login(accessToken);

      // lấy role từ localStorage (do AuthContext set)
      const role = localStorage.getItem("role");

      // redirect
      if (role === "SUPER_ADMIN") {
        navigate("/super-admin/accounts", { replace: true });
      } else {
        navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="w-full bg-gray-100 h-screen flex items-start justify-center pt-20">
      <div className="bg-white w-1/2 lg:w-1/3 xl:w-1/4 rounded-2xl shadow-xl p-8 flex flex-col gap-4">
        <h1 className="font-extrabold text-2xl text-center text-[#5B94FF]">
          Hệ thống quản lý nhà hàng
        </h1>
        <h2 className="font-extrabold text-xl text-center">Đăng nhập</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label>
            <p className="font-bold mb-1">Email</p>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#5B94FF]/30 h-10 rounded px-2"
            />
          </label>

          <label>
            <p className="font-bold mb-1">Mật khẩu</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#5B94FF]/30 h-10 rounded px-2"
            />
          </label>

          <div className="w-full flex flex-col items-center gap-2">
            <button
              type="submit"
              className="w-full bg-[#5B94FF] py-2 px-4 rounded-[5px] font-bold text-white cursor-pointer"
            >
              Đăng nhập
            </button>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              Tài khoản sử dụng hệ thống do Quản trị viên cấp. Vui lòng liên hệ
              Quản lý hệ thống nếu bạn chưa có tài khoản.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== helper ===== */
function createFakeJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode(header)}.${encode(payload)}.fake-signature`;
}

export default Login;

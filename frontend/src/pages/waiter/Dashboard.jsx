import { useEffect, useState, useRef } from "react";
import {
  Bell,
  UtensilsCrossed,
  Check,
  XCircle,
  Clock,
  ChefHat,
  Sparkles,
  Clock3,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import StaffDetailOrder from "../../components/waiter/StaffDetailOrder";
import tenantApi from "../../api/tenantApi";
import orderApi from "../../api/orderApi";

/* ===== STATUS CONFIG ===== */
const STATUS_META = {
  Paid: {
    label: "Đã thanh toán",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Check,
  },
  Pending_payment: {
    label: "Chờ thanh toán",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Clock,
  },
  Pending_approval: {
    label: "Chờ duyệt",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  Approved: {
    label: "Đã duyệt",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Check,
  },
  Cooking: {
    label: "Đang nấu",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: ChefHat,
  },
  Cooked: {
    label: "Đã nấu xong",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Sparkles,
  },
  Serving: {
    label: "Đang phục vụ",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: UtensilsCrossed,
  },
  Rejected: {
    label: "Từ chối",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: XCircle,
  },
};

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [tenant, setTenant] = useState(null);

  // Thông báo mới
  const [notifications, setNotifications] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState(new Set());

  const wsRef = useRef(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  /* ===== INIT ===== */
  useEffect(() => {
    fetchTenantProfile();
    fetchOrders();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.deactivate();
    };
  }, []);

  /* ===== TENANT ===== */
  const fetchTenantProfile = async () => {
    try {
      const res = await tenantApi.getTenantProfile();
      setTenant(res.result);
    } catch (err) {
      console.error("Tenant error:", err);
    }
  };

  /* ===== ORDERS FROM API ===== */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.tenantGetAllOrder();
      setOrders(res.result || []);
    } catch (err) {
      console.error("Get orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== WEBSOCKET ===== */
  const connectWebSocket = () => {
    const socket = new SockJS(
      `http://localhost:${import.meta.env.VITE_SERVER_PORT}/ws`
    );

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/orders", (message) => {
        const order = JSON.parse(message.body);
        console.log("Received order update via WebSocket:", order);
        handleNewOrder(order);
      });
    };

    stompClient.activate();
    wsRef.current = stompClient;
  };

  const handleNewOrder = (order) => {
    // Thêm thông báo nếu có message
    if (order.message) {
      const notification = {
        id: Date.now(),
        orderId: order.orderId,
        tableId: order.tableId,
        message: order.message,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev]);

      // Đánh dấu đơn hàng mới
      setNewOrderIds((prev) => new Set([...prev, order.orderId]));

      // Tự động xóa thông báo sau 10 giây
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 10000);
    }

    // Cập nhật danh sách đơn hàng
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.orderId === order.orderId);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = order;
        return updated;
      }
      return [order, ...prev];
    });
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userName");
      navigate("/login");
    }
  };

  /* ===== ACTIONS ===== */
  const handleApprove = async (orderId) => {
    setProcessing(true);
    try {
      const res = await orderApi.updateStatus(orderId, {
        status: "Approved",
      });

      setSelectedOrder(null);
      fetchOrders();

      // Xóa đánh dấu "mới"
      setNewOrderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    } catch (err) {
      console.error("Approve order error:", err);
      alert("Duyệt đơn thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (orderId) => {
    setProcessing(true);
    try {
      const res = await orderApi.updateStatus(orderId, {
        status: "Rejected",
      });

      setSelectedOrder(null);
      fetchOrders();

      // Xóa đánh dấu "mới"
      setNewOrderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    } catch (err) {
      console.error("Reject order error:", err);
      alert("Từ chối đơn thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleOrderClick = (order) => {
    // Xóa đánh dấu "mới" khi click vào đơn
    setNewOrderIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(order.orderId);
      return newSet;
    });
    setSelectedOrder(order);
  };

  /* ===== FILTER ===== */
  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.oderStatus === statusFilter);

  const countByStatus = (status) =>
    orders.filter((o) => o.oderStatus === status).length;

  /* ===== UI ===== */
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-3xl shadow p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                {tenant?.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.nameTenant}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-indigo-600 text-white">
                    <UtensilsCrossed size={28} className="sm:size-8" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                  {tenant?.nameTenant || "Dashboard Staff"}
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                  Theo dõi đơn hàng realtime
                </p>
                {tenant && (
                  <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1">
                    <Clock3 size={14} className="sm:size-4" />
                    {tenant.openHours} – {tenant.closeHours}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                <User size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {userName || "Staff"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== NOTIFICATIONS ===== */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-slide-in"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{notif.message}</p>
                  <p className="text-xs opacity-90 mt-1">
                    Vừa xong - Order #{notif.orderId}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== notif.id)
                    )
                  }
                  className="text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Pending_approval", "Cooking", "Serving", "Paid"].map((s) => {
            const Icon = STATUS_META[s].icon;
            return (
              <div key={s} className="bg-white rounded-2xl p-6 shadow">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${STATUS_META[s].color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-3xl font-bold">{countByStatus(s)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {STATUS_META[s].label}
                </p>
              </div>
            );
          })}
        </div>

        {/* ===== LIST ===== */}
        {loading && <p>Đang tải đơn hàng...</p>}

        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const meta = STATUS_META[order.oderStatus];
            const Icon = meta?.icon || Bell;
            const isNew = newOrderIds.has(order.orderId);

            return (
              <div
                key={order.orderId}
                onClick={() => handleOrderClick(order)}
                className={`bg-white rounded-2xl p-6 shadow cursor-pointer hover:shadow-md transition-all duration-200 relative overflow-hidden ${
                  isNew
                    ? "ring-2 ring-indigo-500 animate-pulse-border"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Badge "MỚI" */}
                {isNew && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-linear-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                      MỚI
                    </span>
                  </div>
                )}

                {/* Hiệu ứng sáng cho đơn mới */}
                {isNew && (
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                )}

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        meta?.color || "bg-gray-100"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <strong className="text-lg">
                        Order #{order.orderId}
                      </strong>
                      <p className="text-sm text-slate-500">
                        Bàn {order.tableId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-xl border font-medium ${
                      meta?.color || ""
                    }`}
                  >
                    {meta?.label || "Không rõ"}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {selectedOrder && (
        <StaffDetailOrder
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

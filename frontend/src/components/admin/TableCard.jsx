"use client";

import { QrCode, Pencil, Download } from "lucide-react";

/* ====== STATUS LOGIC ====== */
const getTableStatus = (table) => {
  if (!table.is_active) return "inactive";

  // MOCK occupied (sau này thay = order thực tế)
  if (["T001", "T004", "T005"].includes(table.table_id)) {
    return "occupied";
  }

  return "available";
};

export default function TableCard({ table, onEdit, onQR, onDownload }) {
  const status = getTableStatus(table);

  const statusConfig = {
    available: {
      label: "Có sẵn",
      border: "border-green-500/50",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    occupied: {
      label: "Đã sử dụng",
      border: "border-red-500/50",
      bg: "bg-red-50",
      text: "text-red-700",
    },
    inactive: {
      label: "Không hoạt động",
      border: "border-gray-300",
      bg: "bg-gray-50",
      text: "text-gray-400",
    },
  };

  const activeQR = table.qr_history.find((qr) => qr.is_active);

  return (
    <div
      className={`w-[260px] rounded-xl border-2 p-4 transition hover:shadow-md
        ${statusConfig[status].border}
        ${statusConfig[status].bg}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{table.table_name}</h3>
        <span className={`text-xs font-medium ${statusConfig[status].text}`}>
          {statusConfig[status].label}
        </span>
      </div>

      {/* INFO */}
      <div className="text-sm text-gray-600 mb-3 space-y-1">
        <div>Khu vực: {table.section}</div>
        <div>
          QR:{" "}
          {activeQR ? (
            <span className="text-gray-800">{activeQR.created_at}</span>
          ) : (
            <span className="italic text-gray-400">Chưa có</span>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={onQR}
          className="flex items-center justify-center gap-1 flex-1 text-xs border border-gray-400 rounded-md py-1 hover:bg-white cursor-pointer"
        >
          <QrCode size={14} />
          QR
        </button>

        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1 flex-1 text-xs border border-gray-400 rounded-md py-1 hover:bg-white cursor-pointer"
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-1 flex-1 text-xs border border-gray-400 rounded-md py-1 hover:bg-white cursor-pointer"
        >
          <Download size={14} />
          Save
        </button>
      </div>
    </div>
  );
}

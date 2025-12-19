"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

import TableCard from "../../components/admin/TableCard";
import CreateTableDialog from "../../components/admin/CreateTableDialog";
import EditTableDialog from "../../components/admin/EditTableDialog";
import DeleteTableDialog from "../../components/admin/DeleteTableDialog";

/* ===== MOCK DATA ===== */
const mock_tables = [
  {
    table_id: "T001",
    table_name: "Bàn 01",
    section: "Indoor",
    is_active: true,
    created_at: "2024-01-10",
    updated_at: "2024-01-15",
    qr_history: [
      {
        qr_id: "QR001",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
      },
    ],
  },
  {
    table_id: "T002",
    table_name: "Bàn 02",
    section: "Outdoor",
    is_active: true,
    created_at: "2024-02-01",
    updated_at: "2024-02-10",
    qr_history: [
      {
        qr_id: "QR002",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-02-10",
        updated_at: "2024-02-10",
      },
    ],
  },
  {
    table_id: "T003",
    table_name: "VIP-01",
    section: "VIP Room",
    is_active: false,
    created_at: "2024-03-05",
    updated_at: "2024-03-07",
    qr_history: [
      {
        qr_id: "QR003",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-03-07",
        updated_at: "2024-03-07",
      },
    ],
  },
  {
    table_id: "T004",
    table_name: "Bàn 01",
    section: "Indoor",
    is_active: true,
    created_at: "2024-01-10",
    updated_at: "2024-01-15",
    qr_history: [
      {
        qr_id: "QR001",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
      },
    ],
  },
  {
    table_id: "T005",
    table_name: "Bàn 02",
    section: "Outdoor",
    is_active: true,
    created_at: "2024-02-01",
    updated_at: "2024-02-10",
    qr_history: [
      {
        qr_id: "QR002",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-02-10",
        updated_at: "2024-02-10",
      },
    ],
  },
  {
    table_id: "T006",
    table_name: "VIP-01",
    section: "VIP Room",
    is_active: false,
    created_at: "2024-03-05",
    updated_at: "2024-03-07",
    qr_history: [
      {
        qr_id: "QR003",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-03-07",
        updated_at: "2024-03-07",
      },
    ],
  },
  {
    table_id: "T007",
    table_name: "Bàn 01",
    section: "Indoor",
    is_active: true,
    created_at: "2024-01-10",
    updated_at: "2024-01-15",
    qr_history: [
      {
        qr_id: "QR001",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
      },
    ],
  },
  {
    table_id: "T008",
    table_name: "Bàn 02",
    section: "Outdoor",
    is_active: true,
    created_at: "2024-02-01",
    updated_at: "2024-02-10",
    qr_history: [
      {
        qr_id: "QR002",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-02-10",
        updated_at: "2024-02-10",
      },
    ],
  },
  {
    table_id: "T009",
    table_name: "VIP-01",
    section: "VIP Room",
    is_active: false,
    created_at: "2024-03-05",
    updated_at: "2024-03-07",
    qr_history: [
      {
        qr_id: "QR003",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-03-07",
        updated_at: "2024-03-07",
      },
    ],
  },
  {
    table_id: "T010",
    table_name: "Bàn 01",
    section: "Indoor",
    is_active: true,
    created_at: "2024-01-10",
    updated_at: "2024-01-15",
    qr_history: [
      {
        qr_id: "QR001",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
      },
    ],
  },
  {
    table_id: "T011",
    table_name: "Bàn 02",
    section: "Outdoor",
    is_active: true,
    created_at: "2024-02-01",
    updated_at: "2024-02-10",
    qr_history: [
      {
        qr_id: "QR002",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-02-10",
        updated_at: "2024-02-10",
      },
    ],
  },
  {
    table_id: "T012",
    table_name: "VIP-01",
    section: "VIP Room",
    is_active: false,
    created_at: "2024-03-05",
    updated_at: "2024-03-07",
    qr_history: [
      {
        qr_id: "QR003",
        qr_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Superqr.svg/330px-Superqr.svg.png",
        is_active: true,
        created_at: "2024-03-07",
        updated_at: "2024-03-07",
      },
    ],
  },
];

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    setTables(mock_tables);
  }, []);

  /* ===== FILTER ===== */
  const filteredTables = tables.filter((t) =>
    t.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ===== GROUP STATUS ===== */
  const occupiedIds = ["T001", "T004", "T005"];

  const groupedTables = {
    available: filteredTables.filter(
      (t) => t.is_active && !occupiedIds.includes(t.table_id)
    ),
    occupied: filteredTables.filter(
      (t) => t.is_active && occupiedIds.includes(t.table_id)
    ),
    inactive: filteredTables.filter((t) => !t.is_active),
  };

  /* ===== QR ===== */
  const handleRegenerateQR = (table) => {
    const newQR = {
      qr_id: `QR${Date.now()}`,
      qr_url: `https://restaurant.com/menu?table=${table.table_id}`,
      is_active: true,
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
    };

    setTables((prev) =>
      prev.map((t) =>
        t.table_id === table.table_id
          ? {
              ...t,
              qr_history: [
                ...t.qr_history.map((qr) => ({ ...qr, is_active: false })),
                newQR,
              ],
            }
          : t
      )
    );

    toast.success("Tạo lại QR thành công");
  };

  // const handleDownloadQR = async (table) => {
  //   const activeQR = table.qr_history.find((qr) => qr.is_active);
  //   if (!activeQR) return;

  //   const res = await fetch(activeQR.qr_url);
  //   const blob = await res.blob();
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${table.table_name}.png`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  const handleDownloadQR = async (table) => {
    const activeQR = table.qr_history.find((qr) => qr.is_active);
    if (!activeQR) {
      toast.error("No active QR found");
      return;
    }

    try {
      const res = await fetch(activeQR.qr_url);
      const blob = await res.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64Image = reader.result;

        // 👉 A4 PDF
        const pdf = new jsPDF("p", "mm", "a4");

        /* ===== HEADER ===== */
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("TABLE INFORMATION", 105, 20, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text("Restaurant ABC", 105, 28, { align: "center" });

        /* ===== INFO ===== */
        pdf.text(`Table ID: ${table.table_id}`, 20, 45);
        pdf.text(`Table Name: ${table.table_name}`, 20, 55);
        pdf.text(`Section: ${table.section}`, 20, 65);
        pdf.text(`Status: ${table.is_active ? "Active" : "Inactive"}`, 20, 75);
        pdf.text(`QR Created: ${activeQR.created_at}`, 20, 85);

        /* ===== QR IMAGE ===== */
        pdf.addImage(base64Image, "PNG", 120, 45, 60, 60);

        /* ===== FOOTER ===== */
        pdf.setFontSize(10);
        pdf.text("Scan QR to view menu", 150, 115, { align: "center" });

        /* ===== FILE NAME ===== */
        // "Bàn 02" -> "02"
        const tableNumber =
          table.table_name.match(/\d+/)?.[0] || table.table_id;

        pdf.save(`QR_${tableNumber}.pdf`);
      };
    } catch (error) {
      toast.error("Download QR failed");
    }
  };

  const handleDownloadAllQR = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let isFirstPage = true;

    for (const table of tables) {
      const activeQR = table.qr_history.find((qr) => qr.is_active);
      if (!activeQR) continue;

      try {
        const res = await fetch(activeQR.qr_url);
        const blob = await res.blob();

        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result);
        });

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        /* ===== HEADER ===== */
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("TABLE INFORMATION", 105, 20, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text("Restaurant ABC", 105, 28, { align: "center" });

        /* ===== INFO ===== */
        pdf.text(`Table ID: ${table.table_id}`, 20, 45);
        pdf.text(`Table Name: ${table.table_name}`, 20, 55);
        pdf.text(`Section: ${table.section}`, 20, 65);
        pdf.text(`Status: ${table.is_active ? "Active" : "Inactive"}`, 20, 75);
        pdf.text(`QR Created: ${activeQR.created_at}`, 20, 85);

        /* ===== QR IMAGE ===== */
        pdf.addImage(base64Image, "PNG", 120, 45, 60, 60);

        /* ===== FOOTER ===== */
        pdf.setFontSize(10);
        pdf.text("Scan QR to view menu", 150, 115, { align: "center" });
      } catch (err) {
        console.error("Skip table:", table.table_id);
      }
    }

    pdf.save("ALL_TABLE_QR.pdf");
  };

  return (
    <div className="col-start-2 col-end-12 space-y-6 py-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2 md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý bàn & QR</h1>
          <p className="text-sm text-gray-500">
            Hiển thị theo card & trạng thái
          </p>
        </div>

        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md cursor-pointer hover:opacity-90"
        >
          <Plus size={18} />
          Thêm bàn
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-lg border border-gray-200  shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-400 rounded-md text-sm"
            placeholder="Tìm bàn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE CARDS */}
      <div className="bg-white p-6 rounded-lg border border-gray-200  shadow-sm space-y-10">
        <div className="flex items-center justify-between">
          <p className="font-bold">Danh sách bàn</p>
          <button
            onClick={handleDownloadAllQR}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:opacity-90"
          >
            Tải tất cả QR
          </button>
        </div>

        {[
          { key: "available", title: "🟢 Có sẵn" },
          { key: "occupied", title: "🔴 Đã sử dụng" },
          { key: "inactive", title: "⚪ Không hoạt động" },
        ].map((group) => (
          <div key={group.key}>
            <h2 className="mb-4 font-semibold text-lg">{group.title}</h2>
            <div className="flex flex-wrap gap-5">
              {groupedTables[group.key].map((table) => (
                <TableCard
                  key={table.table_id}
                  table={table}
                  onEdit={() => {
                    setSelectedTable(table);
                    setIsEditDialogOpen(true);
                  }}
                  onQR={() => handleRegenerateQR(table)}
                  onDownload={() => handleDownloadQR(table)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DIALOGS */}
      {isCreateDialogOpen && (
        <CreateTableDialog onClose={() => setIsCreateDialogOpen(false)} />
      )}

      {isEditDialogOpen && selectedTable && (
        <EditTableDialog
          table={selectedTable}
          tables={tables}
          setTables={setTables}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}

      {isDeleteDialogOpen && selectedTable && (
        <DeleteTableDialog
          table={selectedTable}
          tables={tables}
          setTables={setTables}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}

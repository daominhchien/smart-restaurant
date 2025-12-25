import { useEffect, useState } from "react";
import itemApi from "../../api/itemApi";
import categoryApi from "../../api/categoryApi";
import Overlay from "../common/Overlay";
import toast from "react-hot-toast";

/* ================= CLOUDINARY CONFIG ================= */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function AddItemModal({ onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    price: "",
    status: true,
    avatarUrl: "",
    categoryIds: [],
  });

  /* ================= FETCH CATEGORY ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAllCategories();
        setCategories(res?.result || []);
      } catch (err) {
        toast.error("Không tải được danh mục");
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategories();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (e) => {
    const value = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      categoryIds: value ? [value] : [],
    }));
  };

  /* ================= CLOUDINARY UPLOAD ================= */
  const handleUploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();

    if (!res.ok) {
      console.error("Cloudinary error:", json);
      throw new Error(json.error?.message || "Upload failed");
    }

    return json.secure_url;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImg(true);
      const url = await handleUploadImage(file);

      setForm((prev) => ({
        ...prev,
        avatarUrl: url,
      }));

      toast.success("Upload ảnh thành công");
    } catch (err) {
      toast.error("Upload ảnh thất bại");
    } finally {
      setUploadingImg(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.itemName.trim()) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }

    if (form.categoryIds.length === 0) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    try {
      setSaving(true);

      await itemApi.addNewItem({
        ...form,
        price: Number(form.price),
      });

      toast.success("Thêm sản phẩm thành công");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thêm sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Thêm sản phẩm</h2>
          <button
            onClick={onClose}
            className="
            w-8 h-8
            flex items-center justify-center
            rounded-full
            text-gray-400
            hover:bg-gray-100 hover:text-gray-600
            transition
          "
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Tên sản phẩm
            </label>
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              className="
              w-full
              border border-gray-300
              rounded-md
              px-3 py-2
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-blue-500
            "
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả sản phẩm"
              rows={3}
              className="
              w-full
              border border-gray-300
              rounded-md
              px-3 py-2
              text-sm
              resize-none
              focus:outline-none
              focus:ring-2 focus:ring-blue-500
            "
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Giá bán</label>
            <input
              type="number"
              step="0.1"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Ví dụ: 25000"
              className="
              w-full
              border border-gray-300
              rounded-md
              px-3 py-2
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-blue-500
            "
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <select
              value={form.categoryIds[0] || ""}
              onChange={handleCategorySelect}
              className="
              w-full
              border border-gray-300
              rounded-md
              px-3 py-2
              text-sm
              bg-white
              focus:outline-none
              focus:ring-2 focus:ring-blue-500
            "
            >
              <option value="">-- Chọn danh mục --</option>
              {!loadingCategory &&
                categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
            </select>
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ảnh sản phẩm
            </label>

            {!form.avatarUrl && (
              <label
                htmlFor="image-upload"
                className="
                  border-2 border-dashed border-gray-300
                  rounded-lg
                  flex flex-col items-center justify-center
                  text-center
                  hover:border-blue-400
                  transition
                  cursor-pointer
                  p-4
                "
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <p className="text-sm text-gray-600">Click để chọn ảnh</p>

                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG — dung lượng nhỏ hơn 5MB
                </p>
              </label>
            )}
            {uploadingImg && (
              <p className="text-xs text-blue-500">Đang upload ảnh...</p>
            )}

            {form.avatarUrl && (
              <img
                src={form.avatarUrl}
                alt="preview"
                className="
                mt-2
              
                w-full
                object-cover
                rounded-md
                border
                border-gray-300
              "
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="
              px-4 py-2
              text-sm
              rounded-md
              border
              text-gray-700
              hover:bg-gray-100
              transition
            "
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImg}
              className="
              px-5 py-2
              text-sm
              rounded-md
              bg-blue-600
              text-white
              hover:bg-blue-700
              disabled:opacity-50
              transition
            "
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

export default AddItemModal;

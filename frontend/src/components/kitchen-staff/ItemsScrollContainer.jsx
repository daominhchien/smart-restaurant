import { useRef, useState, useEffect } from "react";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

// Component riêng để xử lý scroll items
function ItemsScrollContainer({ detailOrders, itemMap }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Kiểm tra khả năng scroll
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [detailOrders]);

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isScrollable = container.scrollWidth > container.clientWidth;

      if (isScrollable) {
        e.preventDefault();
        e.stopPropagation();
        container.scrollLeft += e.deltaY > 0 ? 50 : -50;
      }
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-600 font-bold mb-3 flex items-center gap-1">
        <Package size={14} strokeWidth={2} />
        CHI TIẾT ĐƠN
      </p>

      <div className="relative">
        {/* Nút scroll trái */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hover:-translate-x-0.75 cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg border-2 border-gray-300 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Nút scroll phải */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hover:translate-x-0.75 cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg border-2 border-gray-300 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onScroll={checkScrollability}
          className="overflow-x-auto scrollbar-hide scroll-smooth py-2"
        >
          <div className="flex gap-4 pb-2">
            {detailOrders.map((detail, idx) => {
              const item = itemMap[detail.itemId];
              if (!item) return null;

              return (
                <div
                  key={idx}
                  className="shrink-0 w-40 bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md flex flex-col justify-between
                  items-center text-center hover:shadow-lg hover:-translate-y-0.75 transition-all "
                >
                  <div>
                    {/* IMAGE */}
                    <img
                      src={item.avatarUrl}
                      alt={item.itemName}
                      className="w-32 h-32 object-cover rounded-lg mb-3 ring-2 ring-gray-200"
                    />

                    {/* NAME */}
                    <p className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">
                      {item.itemName}
                    </p>

                    {/* MODIFIERS */}
                    {detail.modifiers.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 text-center font-medium">
                        {detail.modifiers.map((mod, midx) => (
                          <p key={midx}>• {mod.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    {/* QTY */}
                    <div className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg text-base font-bold shadow-sm">
                      ×{detail.quantity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemsScrollContainer;

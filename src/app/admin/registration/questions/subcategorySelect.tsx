import { useCallback, useEffect, useRef, useState } from "react";

const SubcategorySelect = ({
  subcategories,
  activeButton,
  onChange,
}: {
  subcategories: {
    id: number;
    name: string;
    categoryId: number;
  }[];
  activeButton: number | string;
  onChange: (value: number | string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const updateFade = useCallback(() => {
    if (containerRef.current) {
      const rightFadeVisible =
        containerRef.current.scrollWidth > containerRef.current.clientWidth &&
        containerRef.current.scrollLeft + containerRef.current.clientWidth <
          containerRef.current.scrollWidth - 8;
      const leftFadeVisible = containerRef.current.scrollLeft > 8;
      setShowRightFade(rightFadeVisible);
      setShowLeftFade(leftFadeVisible);
    }
  }, []);
  useEffect(() => {
    updateFade();
    const handleResize = () => updateFade();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateFade, subcategories]);
  return (
    <div className="relative w-full">
      <div
        className="flex gap-1 overflow-x-auto"
        ref={containerRef}
        onScroll={updateFade}
      >
        {subcategories.length > 0 && (
          <button
            value="ALL"
            className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === "ALL" ? "bg-gray-900/50" : "bg-gray-900/20"} bg-gray-900/40`}
            onClick={() => onChange("ALL")}
          >
            TODAS
          </button>
        )}
        <button
          className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === "NULL" ? "bg-gray-900/50" : "bg-gray-900/20"} bg-gray-900/40`}
          onClick={() => onChange("NULL")}
        >
          NENHUMA
        </button>
        {subcategories.map((subcategory) => {
          return (
            <button
              className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === subcategory.id ? "bg-gray-900/50" : "bg-gray-900/20"} bg-gray-900/40`}
              key={subcategory.id}
              onClick={() => onChange(subcategory.id)}
            >
              {subcategory.name}
            </button>
          );
        })}
      </div>
      {showRightFade && (
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-l from-gray-500/90 to-transparent"></div>
      )}
      {showLeftFade && (
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-10 bg-gradient-to-r from-gray-500/90 to-transparent"></div>
      )}
    </div>
  );
};

export default SubcategorySelect;

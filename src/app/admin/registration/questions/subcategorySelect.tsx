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
  //const [activeButton, setActiveButton] = useState<number | string>("NULL");
  return (
    <div className="flex gap-1 overflow-x-auto">
      {subcategories.length > 0 && (
        <button
          value="ALL"
          className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === "ALL" ? "bg-gray-900/50" : "bg-gray-900/20"} hover:bg-gray-900/40`}
          onClick={() => onChange("ALL")}
        >
          TODAS
        </button>
      )}
      <button
        className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === "NULL" ? "bg-gray-900/50" : "bg-gray-900/20"} hover:bg-gray-900/40`}
        onClick={() => onChange("NULL")}
      >
        NENHUMA
      </button>
      {subcategories.map((subcategory) => {
        return (
          <button
            className={`text-md rounded-t-xl p-2 sm:text-xl ${activeButton === subcategory.id ? "bg-gray-900/50" : "bg-gray-900/20"} hover:bg-gray-900/40`}
            key={subcategory.id}
            onClick={() => onChange(subcategory.id)}
          >
            {subcategory.name}
          </button>
        );
      })}
    </div>
  );
};

export default SubcategorySelect;

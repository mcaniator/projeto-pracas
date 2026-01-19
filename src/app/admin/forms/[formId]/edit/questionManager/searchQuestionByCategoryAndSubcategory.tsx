import React from "react";

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";

const SearchQuestionByCategoryAndSubcategory = ({
  categories,
  subcategories,
  selectedCategoryAndSubcategoryId,
  setSelectedCategoryAndSubcategoryId,
}: {
  categories: {
    id: number;
    name: string;
    subcategory: {
      id: number;
      name: string;
      notes: string | null;
    }[];
    notes: string | null;
  }[];
  subcategories: {
    id: number;
    name: string;
    notes: string | null;
  }[];
  selectedCategoryAndSubcategoryId: {
    categoryId: number | undefined;
    subcategoryId: number | null;
    verifySubcategoryNullness: boolean;
  };
  setSelectedCategoryAndSubcategoryId: (
    value: React.SetStateAction<{
      categoryId: number | undefined;
      subcategoryId: number | null;
      verifySubcategoryNullness: boolean;
      categoryName?: string;
      subcategoryName?: string;
      categoryNotes?: string | null;
      subcategoryNotes?: string | null;
    }>,
  ) => void;
}) => {
  const fullSubcategoriesOptions = [
    { id: 0, name: "TODAS", notes: null },
    { id: -1, name: "NENHUMA", notes: null },
    ...subcategories,
  ];
  return (
    <div className="flex flex-col gap-2 overflow-auto">
      <h4>Buscar por categoria: </h4>
      <CAutocomplete
        options={categories}
        label="Categoria"
        className="w-full"
        value={categories.find(
          (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
        )}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disableClearable
        onChange={(evt, val) => {
          setSelectedCategoryAndSubcategoryId({
            categoryId: Number(val?.id),
            subcategoryId: 0,
            verifySubcategoryNullness: false,
          });
        }}
      />
      <CAutocomplete
        options={fullSubcategoriesOptions}
        label="Subcategoria"
        className="w-full"
        value={fullSubcategoriesOptions.find(
          (fs) => fs.id === selectedCategoryAndSubcategoryId.subcategoryId,
        )}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disableClearable
        onChange={(evt, val) => {
          setSelectedCategoryAndSubcategoryId({
            ...selectedCategoryAndSubcategoryId,
            subcategoryId: val.id,
            verifySubcategoryNullness: val.id === -1 ? true : false,
          });
        }}
      />
    </div>
  );
};

export default SearchQuestionByCategoryAndSubcategory;

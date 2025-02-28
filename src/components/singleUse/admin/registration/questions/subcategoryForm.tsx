"use client";

import { Button } from "@/components/button";
import { Select } from "@/components/ui/select";
import { subcategorySubmit } from "@/serverActions/categorySubmit";
import { useActionState } from "react";

import { Input } from "../../../../ui/input";

const SubcategoryForm = ({
  availableCategories,
}: {
  availableCategories: { id: number; name: string }[];
}) => {
  const initialState = { statusCode: 0 };
  const [, newSubcategoryFormAction] = useActionState(
    subcategorySubmit,
    initialState,
  );
  if (availableCategories.length === 0) {
    return <div>Nenhuma categoria encontrada!</div>;
  }

  return (
    <div className="flex gap-3">
      <form action={newSubcategoryFormAction}>
        <div className="flex flex-col">
          <div className="flex w-full flex-col">
            <label htmlFor={"categories"}>Categoria</label>
            <Select name="category-id" id={"categories"}>
              {availableCategories.map((value, index) => (
                <option key={index} value={value.id}>
                  {value.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="subcategory-name">Subcategoria</label>
            <div className="flex gap-1">
              <Input
                type="text"
                name="subcategory-name"
                id="subcategory-name"
              />
              <Button type="submit" variant={"admin"}>
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export { SubcategoryForm };

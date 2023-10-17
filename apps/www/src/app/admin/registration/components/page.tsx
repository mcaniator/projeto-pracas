import { AddedOptions } from "@/app/admin/registration/components/elements/addedOptions";
import { CategoryForm } from "@/app/admin/registration/components/elements/categoryForm";
import { QuestionForm } from "@/app/admin/registration/components/elements/questionForm";
import { availableCategories, categoriesJSONSchema } from "@/app/types";

const AdminComponentsPage = async () => {
  const categoriesJSON: categoriesJSONSchema[] = await fetch("http://localhost:3333/category", { next: { tags: ["category"] } }).then((response) => {
    return response.json();
  });

  const availableCategories: availableCategories[] = categoriesJSON.map((result) => {
    return { id: result.id, label: result.name };
  });

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div className={"flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
          <h3 className={"text-2xl font-semibold"}>Criação de Categorias</h3>
          <CategoryForm />
        </div>
        <div className="flex min-h-0 basis-4/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md">
          <h3 className={"text-2xl font-semibold"}>Criação de Perguntas</h3>
          <QuestionForm availableCategories={availableCategories} />
        </div>
      </div>
      <div className={"basis-2/5 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
        <AddedOptions />
      </div>
    </div>
  );
};

export default AdminComponentsPage;

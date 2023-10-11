import { CategoryForm } from "@/app/admin/registration/elements/categoryForm";
import { QuestionForm } from "@/app/admin/registration/elements/questionForm";
import { availableCategories, categoriesJSONSchema } from "@/app/types";

const AdminRoot = async () => {
  const categoriesJSON: categoriesJSONSchema[] = await fetch(
    "http://localhost:3333/category",
    { next: { tags: ["category"] } },
  ).then((response) => {
    return response.json();
  });

  const availableCategories: availableCategories[] = categoriesJSON.map(
    (result) => {
      return { id: result.id, label: result.name };
    },
  );

  return (
    <main className="flex h-full">
      <div className="flex flex-col gap-5 p-5 text-white">
        <h2 className="text-3xl font-bold">Criação de Componentes</h2>
        <div className="flex h-full gap-5 flex-col">
          <div className={"flex flex-col gap-1"}>
            <h3 className={"text-2xl font-semibold"}>Criação de Categorias</h3>
            <CategoryForm />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className={"text-2xl font-semibold"}>Criação de Perguntas</h3>
            <QuestionForm availableCategories={availableCategories} />
          </div>
        </div>
        <div></div>
      </div>
    </main>
  );
};

export default AdminRoot;

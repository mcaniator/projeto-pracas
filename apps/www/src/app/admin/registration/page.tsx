import { categoriesJSONSchema } from "@/app/types";
import { ProfileForm } from "@/components/categoryForm";
import { QuestionForm } from "@/components/questionForm";

const AdminRoot = async () => {
  const categoriesJSON: categoriesJSONSchema[] = await fetch(
    "http://localhost:3333/category",
    { cache: "no-store" },
  ).then((response) => {
    return response.json();
  });

  return (
    <main className="flex">
      <div className="flex flex-col">
        <h2>Criação de Componente</h2>
        <div className="flex flex-col">
          <div>
            <ProfileForm />
          </div>
          <div>
            <QuestionForm categories={categoriesJSON} />
          </div>
        </div>
      </div>
      <div></div>
    </main>
  );
};

export default AdminRoot;

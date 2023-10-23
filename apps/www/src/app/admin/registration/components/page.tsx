import { AddedOptions } from "@/app/admin/registration/components/elements/addedOptions";
import { CategoryForm } from "@/app/admin/registration/components/elements/categoryForm";
import { QuestionForm } from "@/app/admin/registration/components/elements/questionForm";
import { PrismaClient } from "@prisma/client";

const AdminComponentsPage = async () => {
  const prisma = new PrismaClient();
  let categories;
  try {
    categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  } catch (e) {}

  prisma.$disconnect();

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div className={"flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
          <h3 className={"text-2xl font-semibold"}>Criação de Categorias</h3>
          <CategoryForm />
        </div>

        <div className="flex min-h-0 basis-4/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md">
          <h3 className={"text-2xl font-semibold"}>Criação de Perguntas</h3>

          {categories == undefined || categories.length <= 0 ? (
            <div>
              <p>Crie sua primeira categorias acima antes de criar uma pergunta!</p>
              <p>Já criou uma categoria previamente? Verifique o status do servidor aqui!</p>
            </div>
          ) : (
            <QuestionForm availableCategories={categories} />
          )}
        </div>
      </div>
      <div className={"basis-2/5 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
        <AddedOptions />
      </div>
    </div>
  );
};

export default AdminComponentsPage;

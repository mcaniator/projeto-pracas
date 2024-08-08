import { AddedOptions } from "@/components/singleUse/admin/registration/questions/addedOptions";
import { CategoryForm } from "@/components/singleUse/admin/registration/questions/categoryForm";
import { QuestionForm } from "@/components/singleUse/admin/registration/questions/questionForm";
import { SubcategoryForm } from "@/components/singleUse/admin/registration/questions/subcategoryForm";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

const AdminComponentsPage = () => {
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-2/5 flex-col gap-5 text-white">
        <div
          className={
            "flex h-full flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Criação de Categorias</h3>
          <CategoryForm />
        </div>
        <div className="flex h-full flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md">
          <h3 className={"text-2xl font-semibold"}>Criação de Subcategorias</h3>
          <SubcategoryFormRenderer />
        </div>
      </div>
      <div
        className={
          "flex basis-3/5 flex-col overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
        }
      >
        <h3 className={"text-2xl font-semibold"}>Criação de Perguntas</h3>
        <QuestionFormRenderer />
      </div>
    </div>
  );
};

const SubcategoryFormRenderer = async () => {
  const getCacheCategories = unstable_cache(
    async () => await prisma.category.findMany(),
    ["all-categories"],
    {
      revalidate: 120,
      tags: ["category", "database"],
    },
  );
  const categories = await getCacheCategories();

  return (
    <Suspense fallback={<p>Loading</p>}>
      {categories.length <= 0 ?
        <div>
          <p>Crie sua primeira categorias acima antes de criar uma pergunta!</p>
          <p>
            Já criou uma categoria previamente? Verifique o status do servidor
            aqui!
          </p>
        </div>
      : <SubcategoryForm availableCategories={categories} />}
    </Suspense>
  );
};

const QuestionFormRenderer = async () => {
  const getCacheCategories = unstable_cache(
    async () => await prisma.category.findMany(),
    ["all-categories"],
    {
      revalidate: 120,
      tags: ["category", "database"],
    },
  );
  const getCacheSubcategories = unstable_cache(
    async () => await prisma.subcategory.findMany(),
    ["all-subcategories"],
    {
      revalidate: 120,
      tags: ["category", "subcategory", "database"],
    },
  );
  const categories = await getCacheCategories();
  const subcategories = await getCacheSubcategories();

  return (
    <Suspense fallback={<p>Loading</p>}>
      {categories.length <= 0 ?
        <div>
          <p>Crie sua primeira categorias acima antes de criar uma pergunta!</p>
          <p>
            Já criou uma categoria previamente? Verifique o status do servidor
            aqui!
          </p>
        </div>
      : <QuestionForm
          availableCategories={categories}
          availableSubcategories={subcategories}
        />
      }
    </Suspense>
  );
};

export default AdminComponentsPage;

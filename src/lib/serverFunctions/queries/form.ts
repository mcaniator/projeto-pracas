import { FormCalculation } from "@customTypes/forms/formCreation";
import { prisma } from "@lib/prisma";
import { QuestionWithCategories } from "@serverActions/questionUtil";
import { unstable_cache } from "next/cache";

type FormToEditPage = {
  id: number;
  name: string;
  version: number;
  questions: QuestionWithCategories[];
  calculations: FormCalculation[];
};

const fetchForms = async () => {
  try {
    const forms = await prisma.form.findMany({
      where: {
        version: {
          not: 0,
        },
      },
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { statusCode: 200, forms };
  } catch (e) {
    return { statusCode: 500, forms: [] };
  }
};

const fetchFormsLatest = async () => {
  try {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
      orderBy: [
        {
          updatedAt: "asc",
        },
      ],
    });
    return { statusCode: 200, forms };
  } catch (e) {
    return { statusCode: 500, forms: [] };
  }
};

const fetchLatestNonVersionZeroForms = async () => {
  try {
    const forms = await prisma.form.findMany({
      where: {
        NOT: {
          version: 0,
        },
      },
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },

      distinct: ["name"],
      orderBy: [
        {
          name: "asc",
        },
        {
          version: "desc",
        },
      ],
    });
    return { statusCode: 200, forms };
  } catch (e) {
    return { statusCode: 500, forms: [] };
  }
};

const searchFormById = async (id: number) => {
  const cachedForm = unstable_cache(
    async (id: number): Promise<FormToEditPage | undefined | null> => {
      const foundForm = await prisma.form.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          version: true,
          questions: {
            include: {
              options: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              subcategory: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                },
              },
            },
          },
          calculations: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              subcategory: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                },
              },
              questions: true,
            },
          },
        },
      });

      return foundForm;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location", "form", "question"] },
  );
  try {
    const form = await cachedForm(id);
    return { statusCode: 200, form };
  } catch (e) {
    return { statusCode: 500, form: null };
  }
};

const searchformNameById = async (formId: number) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        name: true,
      },
    });
    return { statusCode: 200, formName: form?.name ?? null };
  } catch (e) {
    return { statusCode: 500, formName: null };
  }
};

export {
  fetchForms,
  fetchFormsLatest,
  fetchLatestNonVersionZeroForms,
  searchFormById,
  searchformNameById,
};
export { type FormToEditPage };

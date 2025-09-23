import { prisma } from "@lib/prisma";
import "server-only";

type GetFormReturn = Awaited<ReturnType<typeof getForm>>;

const getForm = async (formId: number) => {
  return await prisma.form.findUnique({
    where: {
      id: formId,
    },
    select: {
      id: true,
      name: true,
      formCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          formQuestions: {
            where: {
              formSubcategoryId: null,
            },
            include: {
              question: {
                select: {
                  id: true,
                  name: true,
                  notes: true,
                  type: true,
                  characterType: true,
                  optionType: true,

                  options: {
                    select: {
                      text: true,
                    },
                  },
                },
              },
            },
          },
          formSubcategories: {
            include: {
              subcategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
              formQuestions: {
                include: {
                  question: {
                    select: {
                      id: true,
                      name: true,
                      notes: true,
                      type: true,
                      characterType: true,
                      optionType: true,
                      options: {
                        select: {
                          text: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export { getForm };
export type { GetFormReturn };

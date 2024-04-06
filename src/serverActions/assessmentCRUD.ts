"use server";

import { prisma } from "@/lib/prisma";

const createAssessment = async (
  name: string,
  locationId: number,
  formId: number,
  userId: string,
  startDate: Date,
  endDate: Date,
) => {
  try {
    await prisma.assessment.create({
      data: {
        name: name,
        startDate: startDate,
        endDate: endDate,
        user: { connect: { id: userId } },
        location: { connect: { id: locationId } },
        form: { connect: { id: formId } },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const createClassification = async (name: string, questionsNames: string[]) => {
  try {
    await prisma.classification.create({
      data: {
        name: name,
        questions: {
          createMany: {
            data: questionsNames.map((questionName) => ({
              name: questionName,
            })),
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const createSubclassification = async (
  name: string,
  classificationId: number,
  questionsNames: string[],
) => {
  //Only classifications without questions can be connected with subclassifications
  try {
    await prisma.classification.create({
      data: {
        name: name,
        parent: {
          connect: { id: classificationId },
        },
        questions: {
          createMany: {
            data: questionsNames.map((questionName) => ({
              name: questionName,
            })),
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const createForm = async (name: string, classificationsIds: number[]) => {
  try {
    await prisma.form.create({
      data: {
        name: name,
        classifications: {
          connect: classificationsIds.map((classificationId) => ({
            id: classificationId,
          })),
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const createAnswer = async (
  answerContent: string,
  questionId: number,
  formId: number,
  locationId: number,
  assessmentId: number,
  classificationId: number,
) => {
  try {
    await prisma.answer.create({
      data: {
        content: answerContent,
        question: { connect: { id: questionId } },
        form: { connect: { id: formId } },
        location: { connect: { id: locationId } },
        assessment: { connect: { id: assessmentId } },
        classification: { connect: { id: classificationId } },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export {
  createAnswer,
  createAssessment,
  createClassification,
  createForm,
  createSubclassification,
};

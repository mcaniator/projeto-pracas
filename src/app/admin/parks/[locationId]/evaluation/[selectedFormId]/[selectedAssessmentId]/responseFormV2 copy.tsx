"use client";

import { Box } from "@mui/material";

import CAccordion from "../../../../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../../../../components/ui/accordion/CAccordionSummary";
import CCheckboxGroup from "../../../../../../../components/ui/cCheckboxGroup";
import CNumberField from "../../../../../../../components/ui/cNumberField";
import CRadioGroup from "../../../../../../../components/ui/cRadioGroup";
import CTextField from "../../../../../../../components/ui/cTextField";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "../../../../../../../lib/serverFunctions/queries/assessment";
import { FormItemUtils } from "../../../../../../../lib/utils/formTreeUtils";

const ResponseFormV2 = ({
  assessmentTree,
}: {
  assessmentTree: {
    id: number;
    formName: string;
    categories: AssessmentCategoryItem[];
  };
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {assessmentTree.categories.map((cat, index) => (
        <Category key={index} category={cat} />
      ))}
    </div>
  );
};

const Category = ({ category }: { category: AssessmentCategoryItem }) => {
  return (
    <CAccordion defaultExpanded>
      <CAccordionSummary>
        <div className="flex flex-row items-center gap-1">{category.name}</div>
      </CAccordionSummary>
      <CAccordionDetails>
        <div className="flex flex-col gap-1">
          {category.categoryChildren.map((child, index) => {
            if (FormItemUtils.isSubcategoryType(child)) {
              return <Subcategory key={index} subcategory={child} />;
            } else if (FormItemUtils.isQuestionType(child)) {
              return <Question key={index} question={child} />;
            }
          })}
        </div>
      </CAccordionDetails>
    </CAccordion>
  );
};

const Subcategory = ({
  subcategory,
}: {
  subcategory: AssessmentSubcategoryItem;
}) => {
  return (
    <Box
      sx={{
        padding: "6px",
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
    >
      <CAccordion defaultExpanded>
        <CAccordionSummary>
          <div className="flex flex-row items-center gap-1">
            {subcategory.name}
          </div>
        </CAccordionSummary>
        <CAccordionDetails>
          <div className="flex flex-col gap-1">
            {subcategory.questions.map((question, index) => (
              <Question key={index} question={question} />
            ))}
          </div>
        </CAccordionDetails>
      </CAccordion>
    </Box>
  );
};

const Question = ({ question }: { question: AssessmentQuestionItem }) => {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
      className="flex flex-col justify-between px-4 py-2"
    >
      <div className="flex flex-row items-center gap-1">{question.name}</div>
      {question.questionType === "WRITTEN" && (
        <WrittenQuestion question={question} />
      )}
      {question.questionType === "OPTIONS" && (
        <OptionsQuestion question={question} />
      )}
    </Box>
  );
};

const WrittenQuestion = ({
  question,
}: {
  question: AssessmentQuestionItem;
}) => {
  if (question.characterType === "NUMBER") {
    return <CNumberField />;
  } else {
    return <CTextField />;
  }
};

const OptionsQuestion = ({
  question,
}: {
  question: AssessmentQuestionItem;
}) => {
  if (!question.options) {
    throw new Error("Options questins without options defined");
  }
  if (question.optionType === "CHECKBOX") {
    return (
      <CCheckboxGroup
        clearable
        options={question.options.map((opt) => opt.text)}
        getOptionValue={(opt) => opt}
        getOptionLabel={(opt) => opt}
      />
    );
  } else {
    return (
      <CRadioGroup
        clearable
        options={question.options.map((opt) => opt.text)}
        getOptionValue={(opt) => opt}
        getOptionLabel={(opt) => opt}
      />
    );
  }
};

export default ResponseFormV2;

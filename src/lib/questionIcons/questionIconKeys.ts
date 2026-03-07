const reactIconPackIds = [
  "ci",
  "fa",
  "fa6",
  "io",
  "io5",
  "md",
  "ti",
  "go",
  "fi",
  "lu",
  "gi",
  "wi",
  "di",
  "ai",
  "bs",
  "ri",
  "fc",
  "gr",
  "hi",
  "hi2",
  "si",
  "sl",
  "im",
  "bi",
  "cg",
  "vsc",
  "tb",
  "tfi",
  "rx",
  "pi",
  "lia",
] as const;

type ReactIconPackId = (typeof reactIconPackIds)[number];
type QuestionIconLibraryId = `ri/${ReactIconPackId}`;

const reactIconPackIdSet = new Set<string>(reactIconPackIds);

const DEFAULT_QUESTION_ICON_KEY = "ri/tb:TbHelp";

const questionIconKeyRegex = /^(ri\/[a-z0-9]+):([A-Za-z][A-Za-z0-9]*)$/;

const parseQuestionIconKey = (
  iconKey: string | null | undefined,
): { libraryId: QuestionIconLibraryId; iconName: string } | null => {
  if (!iconKey) {
    return null;
  }
  const matches = iconKey.match(questionIconKeyRegex);
  if (!matches) {
    return null;
  }
  const libraryId = matches[1];
  const iconName = matches[2];
  if (!libraryId || !iconName) {
    return null;
  }
  const [, packId] = libraryId.split("/");
  if (!packId || !reactIconPackIdSet.has(packId)) {
    return null;
  }

  return { libraryId: libraryId as QuestionIconLibraryId, iconName };
};

const buildQuestionIconKey = (
  libraryId: QuestionIconLibraryId,
  iconName: string,
) => `${libraryId}:${iconName}`;

export {
  buildQuestionIconKey,
  DEFAULT_QUESTION_ICON_KEY,
  parseQuestionIconKey,
  reactIconPackIds,
};
export type { QuestionIconLibraryId, ReactIconPackId };

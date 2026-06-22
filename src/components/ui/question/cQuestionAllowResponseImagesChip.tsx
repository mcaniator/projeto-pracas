import CIconChip from "@components/ui/cIconChip";
import { IconPhoto } from "@tabler/icons-react";

type QuestionAllowResponseImagesProps = {
  allowResponseImages: boolean;
};

const CQuestionAllowResponseImagesChip = ({
  allowResponseImages,
}: QuestionAllowResponseImagesProps) => {
  if (!allowResponseImages) return null;
  return (
    <CIconChip
      icon={<IconPhoto />}
      tooltip={"Permite anexar à resposta imagens do Google Drive"}
    />
  );
};

export default CQuestionAllowResponseImagesChip;

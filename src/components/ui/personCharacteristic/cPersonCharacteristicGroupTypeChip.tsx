import CIconChip from "@/components/ui/cIconChip";
import { IconTags, IconUserCheck } from "@tabler/icons-react";

const CPersonCharacteristicGroupTypeChip = ({
  isTagGroup,
}: {
  isTagGroup: boolean;
}) => {
  return (
    <CIconChip
      icon={isTagGroup ? <IconTags /> : <IconUserCheck />}
      tooltip={
        isTagGroup ?
          "Grupo de tags: uma pessoa pode ter nenhuma, uma ou várias características deste grupo."
        : "Grupo de marcação: cada pessoa recebe exatamente uma característica deste grupo."
      }
    />
  );
};

export default CPersonCharacteristicGroupTypeChip;

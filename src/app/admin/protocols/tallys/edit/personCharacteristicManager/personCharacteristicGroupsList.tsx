import CButton from "@/components/ui/cButton";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import CAccordion from "@components/ui/accordion/CAccordion";
import CAccordionDetails from "@components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@components/ui/accordion/CAccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconCirclePlus, IconPencil } from "@tabler/icons-react";

import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "./types";

const PersonCharacteristicGroupsList = ({
  group,
  showAddToTemplate,
  onEditCharacteristic,
}: {
  group: PersonCharacteristicGroup | null;
  showAddToTemplate: boolean;
  onEditCharacteristic?: (
    characteristic: PersonCharacteristic,
    group: PersonCharacteristicGroup,
  ) => void;
}) => {
  if (!group) {
    return (
      <p className="p-2 text-center text-sm text-gray-600">
        Nenhum grupo encontrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-1">
      <CAccordion
        defaultExpanded
        sx={{
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
        }}
      >
          <CAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "primary.lighter4",
              "&:hover": { backgroundColor: "primary.lighter3" },
            }}
          >
            <div className="flex min-w-0 items-center gap-1 p-1">
              <CPersonCharacteristicGroupTypeChip
                isTagGroup={group.isTagGroup}
              />
              <span className="truncate font-semibold">{group.title}</span>
            </div>
          </CAccordionSummary>
          <CAccordionDetails>
            <div className="flex flex-col gap-2">
              {group.personCharacteristics.length === 0 ?
                <p className="text-sm text-gray-600">
                  Nenhuma característica cadastrada neste grupo.
                </p>
              : group.personCharacteristics.map((characteristic) => (
                  <div
                    key={characteristic.id}
                    className="flex items-center gap-2 rounded border border-gray-300 bg-white p-2"
                  >
                    <span
                      aria-label={`Cor ${characteristic.color}`}
                      className="h-4 w-4 shrink-0 rounded-full border border-gray-400"
                      style={{ backgroundColor: characteristic.color }}
                    />
                    <CDynamicIcon iconKey={characteristic.iconKey} />
                    <span className="min-w-0 flex-1 break-words">
                      {characteristic.name}
                    </span>
                    {onEditCharacteristic && (
                      <CButton
                        variant="text"
                        dense
                        tooltip="Editar característica"
                        aria-label={`Editar ${characteristic.name}`}
                        onClick={() =>
                          onEditCharacteristic(characteristic, group)
                        }
                      >
                        <IconPencil />
                      </CButton>
                    )}
                    {showAddToTemplate && (
                      <CButton
                        variant="text"
                        dense
                        disabled
                        tooltip="A adição ao protocolo será implementada em seguida."
                        aria-label={`Adicionar ${characteristic.name} ao protocolo`}
                      >
                        <IconCirclePlus />
                      </CButton>
                    )}
                  </div>
                ))}
            </div>
          </CAccordionDetails>
      </CAccordion>
    </div>
  );
};

export default PersonCharacteristicGroupsList;

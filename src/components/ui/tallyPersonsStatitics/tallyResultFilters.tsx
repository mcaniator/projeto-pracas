import CCheckbox from "@/components/ui/cCheckbox";
import CSwitch from "@/components/ui/cSwtich";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import type { GetTallySubmissionDataResult } from "@/lib/serverFunctions/queries/tally";

type TallyProtocolStructure =
  GetTallySubmissionDataResult["tallyProtocolStructure"];

type TallyResultFilterBoxProps = {
  tallyProtocolStructure: TallyProtocolStructure;
  activeCharacteristicIds: Set<number>;
  noTagFilterGroupIds: Set<number>;
  onCharacteristicActiveChange: (
    personCharacteristicId: number,
    isActive: boolean,
  ) => void;
  onNoTagFilterChange: (groupId: number, noTagFilterIsActive: boolean) => void;
};

export const TallyResultFilterBox = ({
  tallyProtocolStructure,
  activeCharacteristicIds,
  noTagFilterGroupIds,
  onCharacteristicActiveChange,
  onNoTagFilterChange,
}: TallyResultFilterBoxProps) => (
  <div className="flex flex-col gap-3 rounded border border-gray-300 bg-white p-2">
    {tallyProtocolStructure.tallyProtocolGroups.map((group) => (
      <section
        key={group.id}
        className="flex flex-col gap-1 rounded border border-gray-200 bg-slate-50 p-2"
      >
        <h3 className="flex flex-wrap items-center gap-2 font-semibold">
          {group.personCharacteristicGroup.title}
          <CPersonCharacteristicGroupTypeChip
            isTagGroup={group.personCharacteristicGroup.isTagGroup}
          />
        </h3>
        {group.personCharacteristicGroup.isTagGroup && (
          <p className="text-sm text-gray-600">
            Ao ativar uma ou mais tags, apenas pessoas com aquelas tags ficam
            ativas.
          </p>
        )}
        {group.personCharacteristicGroup.isTagGroup && (
          <CSwitch
            checked={noTagFilterGroupIds.has(group.id)}
            label="Nenhuma tag"
            onChange={(_, checked) => onNoTagFilterChange(group.id, checked)}
          />
        )}
        <div className="flex flex-col">
          {group.characteristics.map(({ id, personCharacteristic }) => {
            const isActive = activeCharacteristicIds.has(
              personCharacteristic.id,
            );
            const label = (
              <span className="flex items-center gap-2">
                <CDynamicIcon iconKey={personCharacteristic.iconKey} />
                <span>{personCharacteristic.name}</span>
              </span>
            );

            return group.personCharacteristicGroup.isTagGroup ?
                <CCheckbox
                  key={id}
                  checked={isActive}
                  disabled={noTagFilterGroupIds.has(group.id)}
                  sx={{
                    "&.Mui-checked": { color: personCharacteristic.color },
                  }}
                  label={label}
                  onChange={(event) =>
                    onCharacteristicActiveChange(
                      personCharacteristic.id,
                      event.target.checked,
                    )
                  }
                />
              : <div key={id} className="flex items-center gap-1">
                  <CSwitch
                    checked={isActive}
                    inputProps={{
                      "aria-label": personCharacteristic.name,
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: personCharacteristic.color,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: personCharacteristic.color,
                        },
                    }}
                    onChange={(_, checked) =>
                      onCharacteristicActiveChange(
                        personCharacteristic.id,
                        checked,
                      )
                    }
                  />
                  {label}
                </div>;
          })}
        </div>
      </section>
    ))}
  </div>
);

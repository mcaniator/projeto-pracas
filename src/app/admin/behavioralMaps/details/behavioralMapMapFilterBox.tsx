import CCheckbox from "@/components/ui/cCheckbox";
import CSwitch from "@/components/ui/cSwtich";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  Details["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const BehavioralMapMapFilterBox = ({
  groups,
  activeCharacteristicIds,
  noTagFilterGroupIds,
  onCharacteristicActiveChange,
  onNoTagFilterChange,
}: {
  groups: ProtocolGroups;
  activeCharacteristicIds: Set<number>;
  noTagFilterGroupIds: Set<number>;
  onCharacteristicActiveChange: (
    personCharacteristicId: number,
    isActive: boolean,
  ) => void;
  onNoTagFilterChange: (groupId: number, isActive: boolean) => void;
}) => (
  <div className="flex flex-col gap-3 rounded border border-gray-300 bg-white p-2">
    {groups.map((group) => (
      <section
        key={group.id}
        className="flex flex-col gap-1 rounded border border-gray-200 bg-slate-50 p-2"
      >
        <h3 className="font-semibold">
          {group.personCharacteristicGroup.title}
        </h3>
        {group.personCharacteristicGroup.isTagGroup && (
          <>
            <p className="text-sm text-gray-600">
              Selecione as tags que devem estar presentes no mapa.
            </p>
            <CSwitch
              checked={noTagFilterGroupIds.has(group.id)}
              label="Nenhuma tag"
              onChange={(_, checked) => onNoTagFilterChange(group.id, checked)}
            />
          </>
        )}
        <div className="flex flex-col">
          {group.characteristics.map(({ personCharacteristic }) => {
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
                  key={personCharacteristic.id}
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
              : <div
                  key={personCharacteristic.id}
                  className="flex items-center gap-1"
                >
                  <CSwitch
                    checked={isActive}
                    inputProps={{ "aria-label": personCharacteristic.name }}
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

export default BehavioralMapMapFilterBox;

"use client";

import { Input } from "@/components/ui/input";
import { personType } from "@/lib/zodValidators";

const DataFilter = ({
  setBooleanConditionsFilter,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(keyof personType)[]>
  >;
}) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      setBooleanConditionsFilter((prev) => [
        ...prev,
        e.target.value as keyof personType,
      ]);
    else
      setBooleanConditionsFilter((prev) =>
        prev.filter((filter) => filter !== e.target.value),
      );
  };
  return (
    <div className="flex  flex-col gap-5">
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">sub-título</h3>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <span>
                <label htmlFor="isTraversing" className="mr-1">
                  Pessoas passando pela praça
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="isTraversing"
                  type="checkbox"
                  value={"isTraversing"}
                  className="h-4 w-4"
                  onChange={handleFilterChange}
                />
              </span>
            </div>
            <div className="flex items-center">
              <span>
                <label htmlFor="isPersonWithImpairment" className="mr-1">
                  Pessoas com deficiência
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="isPersonWithImpairment"
                  type="checkbox"
                  value={"isPersonWithImpairment"}
                  className="h-4 w-4"
                  onChange={handleFilterChange}
                />
              </span>
            </div>

            <div className="flex items-center">
              <span>
                <label htmlFor="isInApparentIllicitActivity" className="mr-1">
                  Pessoas em aparente ativ. Ilícita
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="isInApparentIllicitActivity"
                  type="checkbox"
                  value={"isInApparentIllicitActivity"}
                  className="h-4 w-4"
                  onChange={handleFilterChange}
                />
              </span>
            </div>

            <div className="flex items-center">
              <span>
                <label htmlFor="isPersonWithoutHousing" className="mr-1">
                  Pessoas em situação de rua
                </label>
              </span>
              <span className="ml-auto">
                <Input
                  id="isPersonWithoutHousing"
                  type="checkbox"
                  value={"isPersonWithoutHousing"}
                  className="h-4 w-4"
                  onChange={handleFilterChange}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DataFilter };
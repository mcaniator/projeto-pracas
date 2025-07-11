"use client";

import { ParkRegisterData } from "@customTypes/parks/parkRegister";
import { IconArrowForwardUp } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "../button";
import { Input } from "../ui/input";

const RequiredParkInfoForm = ({
  parkData,
  goToNextPage,
  setParkData,
}: {
  parkData: ParkRegisterData;
  goToNextPage: () => void;
  setParkData: React.Dispatch<React.SetStateAction<ParkRegisterData>>;
}) => {
  const [showError, setShowError] = useState(false);
  const handlePageChange = () => {
    if (parkData.name && parkData.firstStreet) {
      goToNextPage();
    } else {
      setShowError(true);
    }
  };
  return (
    <div className="flex w-full max-w-[70rem] flex-col">
      <h3 className="text-lg">Informações Básicas</h3>
      <label htmlFor={"name"}>Nome*:</label>
      <Input
        maxLength={255}
        value={parkData.name ?? ""}
        type="text"
        name="name"
        id={"name"}
        className={`w-full ${showError && !parkData.name ? "border-red-500" : ""}`}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            name: e.target.value.trim() === "" ? null : e.target.value,
          }));
        }}
      />
      <label htmlFor="firstStreet" className="mt-3">
        Primeira rua*:
      </label>
      <Input
        maxLength={255}
        value={parkData.firstStreet ?? ""}
        type="text"
        name="firstStreet"
        id="firstStreet"
        className={`w-full ${showError && !parkData.firstStreet ? "border-red-500" : ""}`}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            firstStreet: e.target.value.trim() === "" ? null : e.target.value,
          }));
        }}
      />
      <label htmlFor="secondStreet" className="mt-3">
        Segunda rua:
      </label>
      <Input
        maxLength={255}
        value={parkData.secondStreet ?? ""}
        type="text"
        name="secondStreet"
        id="secondStreet"
        className={`w-full`}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            secondStreet: e.target.value.trim() === "" ? null : e.target.value,
          }));
        }}
      />
      <label htmlFor="thirdStreet" className="mt-3">
        Terceira rua:
      </label>
      <Input
        maxLength={255}
        value={parkData.thirdStreet ?? ""}
        type="text"
        name="thirdStreet"
        id="thirdStreet"
        className={`w-full`}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            thirdStreet: e.target.value.trim() === "" ? null : e.target.value,
          }));
        }}
      />
      <label htmlFor="fourthStreet" className="mt-3">
        Quarta rua:
      </label>
      <Input
        maxLength={255}
        value={parkData.fourthStreet ?? ""}
        type="text"
        name="fourthStreet"
        id="fourthStreet"
        className={`w-full`}
        onChange={(e) => {
          setParkData((prev) => ({
            ...prev,
            fourthStreet: e.target.value.trim() === "" ? null : e.target.value,
          }));
        }}
      />
      <div className="mt-3 flex">
        <Button className="ml-auto" onPress={handlePageChange}>
          <IconArrowForwardUp />
        </Button>
      </div>
    </div>
  );
};

export default RequiredParkInfoForm;

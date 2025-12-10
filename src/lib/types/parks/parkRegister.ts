import { BrazilianStates } from "@prisma/client";

type ParkRegisterData = {
  name: string | null;
  popularName: string | null;
  firstStreet: string | null;
  secondStreet: string | null;
  thirdStreet: string | null;
  fourthStreet: string | null;
  cityId: number | null;
  state: BrazilianStates;
  notes: string | null;
  isPark: boolean;
  inactiveNotFound: boolean;
  creationYear: number | null;
  lastMaintenanceYear: number | null;
  overseeingMayor: string | null;
  legislation: string | null;
  usableArea: string | null;
  legalArea: string | null;
  incline: string | null;
  categoryId: number | null;
  typeId: number | null;
  hasGeometry: boolean;
  narrowAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  broadAdministrativeUnitId: number | null;
};

export { type ParkRegisterData };

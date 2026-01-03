import { BrazilianStates } from "@prisma/client";

type ParkRegisterData = {
  locationId: number | null;
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
  usableArea: number | null;
  legalArea: number | null;
  incline: number | null;
  categoryId: number | null;
  typeId: number | null;
  narrowAdministrativeUnitId: number | null;
  intermediateAdministrativeUnitId: number | null;
  broadAdministrativeUnitId: number | null;
  mainImage: File | null;
};

export { type ParkRegisterData };

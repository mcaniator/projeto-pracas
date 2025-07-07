type ParkRegisterData = {
  name: string | null;
  popularName: string | null;
  firstStreet: string | null;
  secondStreet: string | null;
  thirdStreet: string | null;
  fourthStreet: string | null;
  city: string | null;
  state: string | null;
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
  category: string | null;
  type: string | null;
  hasGeometry: boolean;
  narrowAdministrativeUnit: string | null;
  intermediateAdministrativeUnit: string | null;
  broadAdministrativeUnit: string | null;
};

export { type ParkRegisterData };

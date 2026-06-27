import type { UserCar } from "../../features/auth/authSlice";
import type { CarFormValues } from "../../forms/schemas";

// Finds the car that matches the route parameter, or null if missing.
export const findCarById = (
  cars: UserCar[],
  carId: string | null | undefined
): UserCar | null => {
  if (!carId) return null;
  return cars.find((item) => item.id === carId) ?? null;
};

// Converts a stored car into the editable car-form defaults.
export const getCarFormDefaults = (car: UserCar | null): CarFormValues => ({
  name: car?.name ?? "",
  connectorTypes: [...(car?.connectorTypes ?? [])],
  minKW: Number.isFinite(car?.minKW ?? Number.NaN) ? car?.minKW ?? 0 : 0,
  batteryCapacity:
    car?.batteryCapacity != null && Number.isFinite(car.batteryCapacity)
      ? String(car.batteryCapacity)
      : "",
});

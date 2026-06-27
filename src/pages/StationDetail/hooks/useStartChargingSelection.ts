import { useEffect, useMemo, useState } from "react";
import { isVehicleCharging } from "../parsing";
import type { Station } from "../types";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";

/**
 * Owns the start-charging dialog's selection state: which connector + vehicle,
 * with effects that keep them valid as the station/cars change.
 */
export function useStartChargingSelection({
  station,
  activeCar,
  cars,
  activeCarId,
}: {
  station: Station | null;
  activeCar: UserCar | null;
  cars: UserCar[];
  activeCarId: string | null;
}) {
  const [startChargingOpen, setStartChargingOpen] = useState(false);
  const [selectedConnectorType, setSelectedConnectorType] =
    useState<ConnectorType | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    activeCarId ?? null,
  );

  const preferredConnectorType = useMemo(() => {
    if (!station) return undefined;
    const stationConnectorTypes = station.connectors.map(
      (connector) => connector.type,
    );
    if (!stationConnectorTypes.length) return undefined;
    if (activeCar?.connectorTypes?.length) {
      const match = activeCar.connectorTypes.find((type) =>
        stationConnectorTypes.includes(type),
      );
      if (match) return match;
    }
    return stationConnectorTypes[0];
  }, [station, activeCar]);

  const availableConnectorTypes = useMemo(() => {
    if (!station) return [];
    const types = station.connectors.map((connector) => connector.type);
    return Array.from(new Set(types));
  }, [station]);

  useEffect(() => {
    if (!availableConnectorTypes.length) {
      setSelectedConnectorType(null);
      return;
    }
    if (
      selectedConnectorType &&
      availableConnectorTypes.includes(selectedConnectorType)
    ) {
      return;
    }
    setSelectedConnectorType(
      preferredConnectorType ?? availableConnectorTypes[0],
    );
  }, [availableConnectorTypes, preferredConnectorType, selectedConnectorType]);

  useEffect(() => {
    if (!startChargingOpen) return;
    if (!cars.length) {
      setSelectedVehicleId(null);
      return;
    }
    const activeCarMatch = activeCarId
      ? cars.find((car) => car.id === activeCarId)
      : null;
    if (activeCarMatch && !isVehicleCharging(activeCarMatch)) {
      setSelectedVehicleId(activeCarMatch.id);
      return;
    }
    const availableCar = cars.find((car) => !isVehicleCharging(car)) ?? null;
    setSelectedVehicleId(availableCar ? availableCar.id : null);
  }, [activeCarId, cars, startChargingOpen]);

  return {
    startChargingOpen,
    setStartChargingOpen,
    selectedConnectorType,
    setSelectedConnectorType,
    selectedVehicleId,
    setSelectedVehicleId,
    preferredConnectorType,
    availableConnectorTypes,
  };
}

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "../../app/hooks";
import type { CarFormValues } from "../../forms/schemas";
import EditCarFormSection from "./components/EditCarFormSection";
import EditCarLayout from "./components/EditCarLayout";
import EditCarNotFound from "./components/EditCarNotFound";
import { editCarRequest } from "./editCarRoute";
import { findCarById, getCarFormDefaults } from "./utils";

// Edit car page container. The form state lives in the shared AddCarFormCard
// (react-hook-form); this page loads the car from Redux and owns the submit
// side-effect + navigation.
export default function EditCarPage() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const userId = useAppSelector((state) => state.auth.userId) || "";
  const cars = useAppSelector((state) => state.auth.cars);

  const car = useMemo(() => findCarById(cars, carId), [cars, carId]);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleBackToProfile = () => {
    navigate("/profile");
  };

  const handleSubmit = async (values: CarFormValues) => {
    if (!car) return;
    setServerError(null);
    const result = await editCarRequest({
      vehicleId: car.id,
      userId,
      name: values.name,
      connectorTypes: values.connectorTypes,
      minKW: values.minKW,
      batteryCapacity: values.batteryCapacity,
    });
    if (result.ok) {
      navigate("/profile");
    } else {
      setServerError(result.error);
    }
  };

  return (
    <EditCarLayout>
      {car ? (
        <EditCarFormSection
          key={car.id}
          defaultValues={getCarFormDefaults(car)}
          serverError={serverError}
          onDismissError={() => setServerError(null)}
          onSubmit={handleSubmit}
          onCancel={handleBackToProfile}
        />
      ) : (
        <EditCarNotFound onBack={handleBackToProfile} />
      )}
    </EditCarLayout>
  );
}

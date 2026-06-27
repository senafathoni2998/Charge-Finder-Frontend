import AddCarFormCard from "../../AddCar/components/AddCarFormCard";
import {
  CONNECTOR_OPTIONS,
  POWER_MAX,
  POWER_MIN,
  POWER_STEP,
} from "../../AddCar/constants";
import type { CarFormValues } from "../../../forms/schemas";
import EditCarHeader from "./EditCarHeader";

type EditCarFormSectionProps = {
  defaultValues: CarFormValues;
  serverError: string | null;
  onDismissError: () => void;
  onSubmit: (values: CarFormValues) => void | Promise<void>;
  onCancel: () => void;
};

// Renders the edit-car header with the shared (react-hook-form) car form card.
export default function EditCarFormSection({
  defaultValues,
  serverError,
  onDismissError,
  onSubmit,
  onCancel,
}: EditCarFormSectionProps) {
  return (
    <>
      <EditCarHeader />
      <AddCarFormCard
        defaultValues={defaultValues}
        connectorOptions={CONNECTOR_OPTIONS}
        minPower={{ min: POWER_MIN, max: POWER_MAX, step: POWER_STEP }}
        serverError={serverError}
        onDismissError={onDismissError}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel="Update car"
        submittingLabel="Updating..."
      />
    </>
  );
}

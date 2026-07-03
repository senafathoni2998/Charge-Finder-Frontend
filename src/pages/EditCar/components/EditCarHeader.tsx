import { useTranslation } from "react-i18next";
import AddCarHeader from "../../AddCar/components/AddCarHeader";

// Renders the shared header copy for the edit-car flow.
export default function EditCarHeader() {
  const { t } = useTranslation("editCar");

  return (
    <AddCarHeader
      title={t("header.title")}
      subtitle={t("header.subtitle")}
    />
  );
}

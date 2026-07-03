import { useState, type MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { UserCar } from "../../../features/auth/authSlice";

type CarsCardProps = {
  cars: UserCar[];
  activeCarId: string | null;
  onAddCar: () => void;
  onSetActive: (carId: string) => void;
  onRemove: (carId: string) => void;
  onEdit: (carId: string) => void;
};

// Renders the car list card with active car selection controls.
export default function CarsCard({
  cars,
  activeCarId,
  onAddCar,
  onSetActive,
  onRemove,
  onEdit,
}: CarsCardProps) {
  const { t } = useTranslation("profile");
  const hasCars = cars.length > 0;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCarId, setMenuCarId] = useState<string | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const menuCar = cars.find((car) => car.id === menuCarId) ?? null;
  const isMenuCarActive = menuCar ? menuCar.id === activeCarId : false;

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, carId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuCarId(carId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuCarId(null);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleCloseMenu();
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: { xs: 3.5, sm: 4, md: 5 },
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 20px 60px rgba(10,10,16,0.08)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 24px 70px rgba(10,10,16,0.12)",
        },
      }}
    >
      <Box sx={{ height: { xs: 5, sm: 6, md: 8 }, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              spacing={{ xs: 1, sm: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 16, sm: 17, md: 18 } }}>
                  {t("cars.title")}
                </Typography>
                <Typography sx={{ color: UI.text2, fontSize: { xs: 12, sm: 13, md: 14 } }}>
                  {t("cars.subtitle")}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={onAddCar}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGradStrong,
                  color: "white",
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: 13, sm: 14 },
                }}
              >
                {t("cars.addNew")}
              </Button>
            </Stack>
          </Box>

          {hasCars ? (
            <Stack spacing={{ xs: 1, sm: 1.5, md: 1.5 }}>
              {cars.map((car) => {
                const isActive = car.id === activeCarId;
                const isCharging =
                  typeof car.chargingStatus === "string" &&
                  car.chargingStatus.trim().toUpperCase() === "CHARGING";
                const hasBatteryPercent = Number.isFinite(car.batteryPercent);
                const hasBatteryCapacity = Number.isFinite(car.batteryCapacity);
                return (
                  <Box
                    key={car.id}
                    sx={{
                      p: { xs: 1, sm: 1.25, md: 1.5 },
                      borderRadius: { xs: 2.5, sm: 3, md: 4 },
                      border: `1.5px solid ${isActive ? "rgba(124,92,255,0.4)" : UI.border2}`,
                      backgroundColor: isActive
                        ? "rgba(124,92,255,0.08)"
                        : "rgba(10,10,16,0.01)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isActive
                          ? "rgba(124,92,255,0.1)"
                          : "rgba(10,10,16,0.02)",
                      },
                    }}
                  >
                    <Stack spacing={{ xs: 0.75, sm: 1, md: 1.25 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={{ xs: 0.5, sm: 0.75, md: 1 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: UI.text,
                            fontSize: { xs: 14, sm: 15, md: 16 },
                          }}
                        >
                          {car.name}
                        </Typography>
                        {hasBatteryPercent ? (
                          <Chip
                            size="small"
                            label={t("cars.battery", { percent: car.batteryPercent })}
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(0,200,83,0.12)",
                              border: "1px solid rgba(0,200,83,0.35)",
                              color: UI.text,
                              fontWeight: 700,
                              height: { xs: 20, sm: 22, md: 26 },
                              fontSize: { xs: 11, sm: 12 },
                            }}
                          />
                        ) : null}
                        {isCharging ? (
                          <Chip
                            size="small"
                            label={t("cars.charging")}
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(0,200,83,0.12)",
                              border: "1px solid rgba(0,200,83,0.35)",
                              color: UI.text,
                              fontWeight: 800,
                              height: { xs: 20, sm: 22, md: 26 },
                              fontSize: { xs: 11, sm: 12 },
                            }}
                          />
                        ) : null}
                        <Box sx={{ flex: 1 }} />
                        {isActive ? (
                          <Chip
                            size="small"
                            label={t("cars.active")}
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(0,229,255,0.12)",
                              border: "1px solid rgba(0,229,255,0.3)",
                              color: UI.text,
                              fontWeight: 800,
                              height: { xs: 20, sm: 22, md: 26 },
                              fontSize: { xs: 11, sm: 12 },
                            }}
                          />
                        ) : null}
                        <IconButton
                          size="small"
                          onClick={(event) => handleOpenMenu(event, car.id)}
                          sx={{
                            borderRadius: 2.5,
                            border: `1px solid ${UI.border2}`,
                            color: UI.text,
                          }}
                          aria-label={t("cars.actionsAria")}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                        {car.connectorTypes?.map((c) => (
                          <Chip
                            key={c}
                            size="small"
                            label={c}
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(124,92,255,0.12)",
                              borderColor: "rgba(124,92,255,0.35)",
                              color: UI.text,
                              fontWeight: 700,
                              height: { xs: 20, sm: 22, md: 26 },
                              fontSize: { xs: 11, sm: 12 },
                            }}
                          />
                        ))}
                        {!car.connectorTypes?.length ? (
                          <Typography variant="caption" sx={{ color: UI.text3, fontSize: { xs: 11, sm: 12 } }}>
                            {t("cars.noConnectors")}
                          </Typography>
                        ) : null}
                      </Stack>

                      <Stack spacing={0}>
                        <Typography variant="caption" sx={{ color: UI.text2, fontSize: { xs: 10, sm: 11, md: 12 } }}>
                          {t("cars.minPower", { power: car.minKW || 0 })}
                        </Typography>
                        {hasBatteryCapacity ? (
                          <Typography variant="caption" sx={{ color: UI.text2, fontSize: { xs: 10, sm: 11, md: 12 } }}>
                            {t("cars.batteryCapacity", { capacity: car.batteryCapacity })}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 2.5, sm: 3, md: 4 },
                border: `1.5px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 15, sm: 16 } }}>
                {t("cars.emptyTitle")}
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5, fontSize: { xs: 13, sm: 14 } }}>
                {t("cars.emptySubtitle")}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${UI.border}`,
            boxShadow: "0 16px 40px rgba(10,10,16,0.14)",
          },
        }}
      >
        <MenuItem
          disabled={!menuCar || isMenuCarActive}
          onClick={() =>
            menuCar ? handleMenuAction(() => onSetActive(menuCar.id)) : handleCloseMenu()
          }
        >
          <ListItemIcon>
            <CheckCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          {t("cars.menu.use")}
        </MenuItem>
        <MenuItem
          disabled={!menuCar}
          onClick={() =>
            menuCar ? handleMenuAction(() => onEdit(menuCar.id)) : handleCloseMenu()
          }
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          {t("actions.edit", { ns: "common" })}
        </MenuItem>
        <MenuItem
          disabled={!menuCar}
          onClick={() =>
            menuCar ? handleMenuAction(() => onRemove(menuCar.id)) : handleCloseMenu()
          }
          sx={{ color: "rgba(244,67,54,0.95)" }}
        >
          <ListItemIcon sx={{ color: "rgba(244,67,54,0.95)" }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          {t("cars.menu.remove")}
        </MenuItem>
      </Menu>
    </Card>
  );
}

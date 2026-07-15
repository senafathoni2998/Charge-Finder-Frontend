import { Outlet, useLocation, useNavigate, useNavigation } from "react-router";
import {
  AppBar,
  Box,
  Backdrop,
  CircularProgress,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { useTranslation } from "react-i18next";
import { UI } from "../theme/theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setSidebarOpen } from "../features/app/appSlice";
import { InstallAppButton, LanguageSwitcher } from "../components";

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { t } = useTranslation("nav");
  const showBack = location.pathname !== "/";
  const isMapPage = location.pathname === "/";
  const hideProfileButton = location.pathname.startsWith("/profile");
  const isMdUp = useAppSelector((state) => state.app.isMdMode);
  const isAdmin = useAppSelector(
    (state) => state.auth.isAuthenticated && state.auth.role === "admin",
  );
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const isRouteLoading = navigation.state === "loading";
  const navTitle = (() => {
    const path = location.pathname;
    if (path === "/") return t("titles.home");
    if (path.startsWith("/station/")) return t("titles.stationDetail");
    if (path.startsWith("/admin/stations/new")) return t("titles.addStation");
    if (path.startsWith("/admin/stations/") && path.endsWith("/edit")) {
      return t("titles.editStation");
    }
    if (path.startsWith("/admin/users/new")) return t("titles.addUser");
    if (path.startsWith("/admin")) return t("titles.admin");
    if (path.startsWith("/profile/cars/new")) return t("titles.addCar");
    if (path.startsWith("/profile")) return t("titles.profile");
    if (path.startsWith("/trip")) return t("titles.trip");
    return t("titles.home");
  })();
  const navigateBack = () => {
    const path = location.pathname;
    if (path === "/profile") {
      navigate("/");
      return;
    }
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <Backdrop
        open={isRouteLoading}
        sx={{
          color: UI.text,
          zIndex: (theme) => theme.zIndex.modal + 1,
          backgroundColor: "rgba(246,247,251,0.8)",
        }}
      >
        <Stack spacing={1} alignItems="center">
          <CircularProgress size={32} sx={{ color: "rgba(124,92,255,0.9)" }} />
          <Typography sx={{ fontWeight: 700, color: UI.text }}>
            {t("loading")}
          </Typography>
        </Stack>
      </Backdrop>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: UI.glass,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${UI.border2}`,
          color: UI.text,
        }}
      >
        <Toolbar sx={{ gap: 1.25 }}>
          {showBack && (
            <Tooltip title={t("tooltips.back")}>
              <IconButton
                onClick={navigateBack}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label={t("aria.back")}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              background: UI.brandGrad,
              boxShadow: "0 12px 30px rgba(124,92,255,0.14)",
              mr: 0.5,
              color: "white",
            }}
          >
            <Box
              component="img"
              src="/app-logo.svg"
              alt={t("aria.logo")}
              sx={{ width: 22, height: 22 }}
            />
          </Box>
          <Typography
            sx={{ fontWeight: 950, letterSpacing: 0.2, color: UI.text }}
          >
            {navTitle}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <LanguageSwitcher color={UI.text} />

          <InstallAppButton color={UI.text} />

          {isAdmin && (
            <Tooltip title={t("tooltips.admin")}>
              <IconButton
                onClick={() => navigate("/admin")}
                sx={{
                  borderRadius: 3,
                  color: UI.text,
                  // backgroundColor: "rgba(124,92,255,0.08)",
                  ":hover": {
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.03)",
                  },
                }}
                aria-label={t("aria.admin")}
              >
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          )}

          {isMapPage && isAuthenticated && (
            <Tooltip title={t("tooltips.trip")}>
              <IconButton
                onClick={() => navigate("/trip")}
                sx={{
                  borderRadius: 3,
                  color: UI.text,
                  ":hover": {
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.03)",
                  },
                }}
                aria-label={t("aria.trip")}
              >
                <AltRouteIcon />
              </IconButton>
            </Tooltip>
          )}

          {isMapPage && !hideProfileButton && (
            <Tooltip title={t("tooltips.profile")}>
              <IconButton
                onClick={() => navigate("/profile")}
                sx={{
                  borderRadius: 3,
                  color: UI.text,
                  ":hover": {
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.03)",
                  },
                }}
                aria-label={t("aria.profile")}
              >
                <PersonIcon />
              </IconButton>
            </Tooltip>
          )}

          {isMapPage && !isMdUp && (
            <Tooltip title={t("tooltips.filters")}>
              <IconButton
                onClick={() => dispatch(setSidebarOpen(true))}
                sx={{
                  borderRadius: 3,
                  color: UI.text,
                  ":hover": {
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.03)",
                  },
                }}
                aria-label={t("aria.filters")}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}

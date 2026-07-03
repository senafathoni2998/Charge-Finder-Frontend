import {
  Box,
  Card,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { UI } from "../theme/theme";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../i18n";

// Language preference card shown on the Profile page. Mirrors the app bar
// switcher; both drive the same i18next language state.
export default function LanguageCard() {
  const { t, i18n } = useTranslation();
  const current: LanguageCode = i18n.language?.startsWith("id") ? "id" : "en";

  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    value: LanguageCode | null,
  ) => {
    if (value) void i18n.changeLanguage(value);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: UI.shadow,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                background: "rgba(124,92,255,0.10)",
                color: "rgba(124,92,255,0.9)",
              }}
            >
              <LanguageIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("language.title")}
              </Typography>
              <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                {t("language.subtitle")}
              </Typography>
            </Box>
          </Stack>

          <ToggleButtonGroup
            exclusive
            value={current}
            onChange={handleChange}
            aria-label={t("language.change")}
            sx={{
              alignSelf: { xs: "stretch", sm: "auto" },
              "& .MuiToggleButton-root": {
                textTransform: "none",
                borderRadius: 3,
                px: 2.5,
                borderColor: UI.border,
                color: UI.text2,
              },
              "& .Mui-selected": {
                color: UI.text,
                fontWeight: 700,
              },
            }}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <ToggleButton key={language.code} value={language.code}>
                {language.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </CardContent>
    </Card>
  );
}

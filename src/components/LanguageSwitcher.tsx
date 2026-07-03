import { useState } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../i18n";

interface LanguageSwitcherProps {
  /** Icon color, forwarded to the trigger button (e.g. the app bar text color). */
  color?: string;
}

// Globe menu that switches the app language. Reachable from the app bar.
export default function LanguageSwitcher({ color }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const current: LanguageCode = i18n.language?.startsWith("id") ? "id" : "en";

  const handleSelect = (code: LanguageCode) => {
    void i18n.changeLanguage(code);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={t("language.change")}>
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t("language.change")}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{ borderRadius: 3, color }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <MenuItem
            key={language.code}
            selected={current === language.code}
            onClick={() => handleSelect(language.code)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {current === language.code ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            <ListItemText>{language.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

import type { MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { AdminUser } from "../types";
import UserList from "./UserList";

type UserManagementCardProps = {
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  userActionError: string | null;
  usersUpdating: Record<string, boolean>;
  onStatusAction: (user: AdminUser) => void;
  onOpenMenu: (event: MouseEvent<HTMLElement>, user: AdminUser) => void;
  onAddUser: () => void;
};

// Renders the user management card with list and actions.
export default function UserManagementCard({
  users,
  usersLoading,
  usersError,
  userActionError,
  usersUpdating,
  onStatusAction,
  onOpenMenu,
  onAddUser,
}: UserManagementCardProps) {
  const { t } = useTranslation("admin");

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
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                {t("userCard.title")}
              </Typography>
              <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                {t("userCard.subtitle")}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddUser}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
              }}
            >
              {t("userCard.addUser")}
            </Button>
          </Stack>

          <TextField
            placeholder={t("userCard.searchPlaceholder")}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {userActionError ? (
            <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
              {userActionError}
            </Typography>
          ) : null}

          <UserList
            users={users}
            isLoading={usersLoading}
            error={usersError}
            updatingMap={usersUpdating}
            onStatusAction={onStatusAction}
            onOpenMenu={onOpenMenu}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

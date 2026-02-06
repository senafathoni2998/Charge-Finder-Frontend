import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";

type ProfileOverviewCardProps = {
  displayName: string;
  email: string | null;
  regionLabel: string;
  initials: string;
  avatarUrl?: string | null;
  onEditProfile: () => void;
  onChangePassword: () => void;
};

// Renders the profile summary card with user info and primary actions.
export default function ProfileOverviewCard({
  displayName,
  email,
  regionLabel,
  initials,
  avatarUrl,
  onEditProfile,
  onChangePassword,
}: ProfileOverviewCardProps) {
  const emailLabel = email || "demo@chargefinder.app";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: { xs: 4, sm: 5 },
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
      <Box sx={{ height: { xs: 6, sm: 8 }, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ sm: "center" }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                background: UI.brandGrad,
                color: "white",
                fontWeight: 900,
                fontSize: { xs: 22, sm: 24 },
                boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 18, sm: 20 } }}>
                {displayName}
              </Typography>
              <Typography sx={{ color: UI.text2, fontSize: { xs: 13, sm: 14 } }}>
                {emailLabel}
              </Typography>
            </Box>
            <Chip
              label="Active"
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(0,229,255,0.12)",
                border: "1px solid rgba(0,229,255,0.3)",
                color: UI.text,
                fontWeight: 800,
                height: { xs: 26, sm: 28 },
              }}
            />
          </Stack>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Box>
              <Typography sx={{ color: UI.text3, fontSize: { xs: 12, sm: 13 }, mb: 0.25 }}>
                Name
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700, fontSize: { xs: 14, sm: 15 } }}>
                {displayName}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: UI.text3, fontSize: { xs: 12, sm: 13 }, mb: 0.25 }}>
                Email
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700, fontSize: { xs: 14, sm: 15 } }}>
                {emailLabel}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: UI.text3, fontSize: { xs: 12, sm: 13 }, mb: 0.25 }}>
                Plan
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700, fontSize: { xs: 14, sm: 15 } }}>
                {"Driver \u2022 Free"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: UI.text3, fontSize: { xs: 12, sm: 13 }, mb: 0.25 }}>
                Region
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700, fontSize: { xs: 14, sm: 15 } }}>
                {regionLabel}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems={{ sm: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={onEditProfile}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                backgroundColor: "rgba(10,10,16,0.01)",
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Edit profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={onChangePassword}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                backgroundColor: "rgba(10,10,16,0.01)",
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Change password
            </Button>
            <Box sx={{ flex: 1 }} />
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                type="submit"
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  backgroundColor: "rgba(244,67,54,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(244,67,54,1)",
                  },
                  px: { xs: 1.5, sm: 2 },
                }}
              >
                Sign out
              </Button>
            </Form>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

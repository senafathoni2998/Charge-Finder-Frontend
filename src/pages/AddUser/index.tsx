import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import { UI } from "../../theme/theme";
import type { AddUserFormValues } from "../../forms/schemas";
import { createUserRequest } from "./addUserRoute";
import AddUserHeader from "./components/AddUserHeader";
import AddUserFormCard from "./components/AddUserFormCard";

// Add user page container. The form state lives in AddUserFormCard
// (react-hook-form); this page owns the submit side-effect and navigation.
export default function AddUserPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  // Validated by zodResolver(addUserFormSchema) before this runs.
  const handleSubmit = async (values: AddUserFormValues) => {
    setServerError(null);
    const result = await createUserRequest({
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password,
      region: values.region,
    });
    if (result.ok) {
      navigate("/admin");
    } else {
      setServerError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <AddUserHeader />
          <AddUserFormCard
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin")}
          />
        </Stack>
      </Box>
    </Box>
  );
}

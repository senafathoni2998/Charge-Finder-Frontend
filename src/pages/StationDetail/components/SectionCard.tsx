import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

const SectionCard = ({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: UI.border2,
        backgroundColor: UI.surface,
        boxShadow: "0 10px 22px rgba(10,10,16,0.06)",
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 950, color: UI.text }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography variant="body2" sx={{ color: UI.text2, mt: 0.25 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {right}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SectionCard;

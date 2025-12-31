import { Box, Stack, Typography, Chip } from "@mui/material";
import { Connector } from "../../../models/model";
import { UI } from "../../../theme/theme";

const ConnectorRow = ({ c }: { c: Connector }) => {
  const pct = c.ports ? Math.round((c.availablePorts / c.ports) * 100) : 0;
  const availabilityText = `${c.availablePorts}/${c.ports} available`;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${UI.border2}`,
        backgroundColor: "rgba(10,10,16,0.02)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ fontWeight: 900, color: UI.text }}>
            {c.type}
          </Typography>
          <Chip
            size="small"
            label={`${c.powerKW} kW`}
            sx={{
              borderRadius: 999,
              backgroundColor: "rgba(10,10,16,0.04)",
              border: `1px solid ${UI.border2}`,
              color: UI.text2,
              fontWeight: 750,
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              backgroundColor: "rgba(10,10,16,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: 999,
                background: UI.brandGradStrong,
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: UI.text3, fontWeight: 700 }}
          >
            {availabilityText}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ConnectorRow;

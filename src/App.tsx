import { ElectricCar, MyLocation, Search } from "@mui/icons-material";
import {
  Toolbar,
  AppBar,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Stack,
  TextField,
  Drawer,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Slider,
  Divider,
} from "@mui/material";

function App() {
  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1.25 }}>
          <Box sx={{ width: 32, height: 32, mr: 1 }}>
            <ElectricCar fontSize="small" />
          </Box>
          <Typography>ChargeFinder</Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="GitHub Repository">
            <span>
              <IconButton sx={{ border: "1px solid black", borderRadius: 3 }}>
                <MyLocation />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "grid",
          height: "calc(100dvh - 64px)",
          gridTemplateColumns: "380px 1fr",
        }}
      >
        <Box
          sx={{
            borderRight: `1px solid black`,
            overflow: "auto",
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 900 }}>Filters</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search station or area"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(10,10,16,0.04)",
                    borderRadius: 3,
                  },
                }}
              />

              <Box>
                <Typography variant="caption">Availability</Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  sx={{
                    mt: 1,
                    flexWrap: "wrap",
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                    },
                  }}
                >
                  <ToggleButton value="">All</ToggleButton>
                  <ToggleButton value="AVAILABLE">Available</ToggleButton>
                  <ToggleButton value="BUSY">Busy</ToggleButton>
                  <ToggleButton value="OFFLINE">Offline</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="caption">Connector</Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  {["Type 2", "CCS", "CHAdeMO", "Tesla"].map((type) => {
                    return (
                      <Chip
                        key={type}
                        label={type}
                        variant="outlined"
                        size="small"
                        clickable
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption">Max Distance (km)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    50
                  </Typography>
                </Stack>
                <Slider defaultValue={50} max={100} sx={{ mt: 1 }} />
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ opacity: 0.35, borderColor: "black" }} />

          <Stack spacing={1.25}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={{ fontWeight: 900 }}>Stations</Typography>
              <Chip
                label="24"
                size="small"
                sx={{
                  backgroundColor: "rgba(10,10,16,0.04)",
                  border: "1px solid black",
                  fontWeight: 750,
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderLeft: "none",
              backgroundColor: "transparent",
            }}
          >
            <Box
              // ref={containerRef}
              sx={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                background:
                  "radial-gradient(900px 520px at 20% 10%, rgba(124,92,255,0.10), rgba(255,255,255,0) 60%),\n           radial-gradient(900px 520px at 70% 70%, rgba(0,229,255,0.08), rgba(255,255,255,0) 60%),\n           linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
                border: `1px solid black`,
                borderRadius: 0,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: -2,
                  backgroundImage:
                    "linear-gradient(rgba(10,10,16,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,16,0.06) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                  opacity: 0.55,
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;

import { Typography } from "@mui/material";

export default function PlaygroundScoutBanner() {
  return (
    <Typography
      variant="h1"
      sx={{
        fontFamily: "var(--font-barriecito), cursive",
        fontSize: "3rem",
        fontWeight: 400,
        m: 0,
      }}
    >
      Playground Scout
    </Typography>
  );
}
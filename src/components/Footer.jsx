import React from "react";
import { Box, Typography, Container } from "@mui/material";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#4a3a8a",
        borderTop: "1px solid #3d2f74",
        py: 1.5,
        mt: "auto",
        flexShrink: 0
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: "white" }}>
            Contact: angeliki.alexop@gmail.com
          </Typography>
          <Typography variant="body2" sx={{ color: "white" }}>
            © {currentYear} Learn AES. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
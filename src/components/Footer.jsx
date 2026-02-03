import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#4a3a8a",
        borderTop: "1px solid #3d2f74",
        py: 1.5,
        mt: "auto",
        flexShrink: 0,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body1" sx={{ color: "white" }}>
            <a
              href="https://forms.gle/KULY1TU5nHvKTA8T6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                textDecoration: "underline",
                fontSize: "1.1em",
              }}
            >
              {t("common.contactUs")}
            </a>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

import React from "react";
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Container,
  Box,
  Button,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Grid3x3 } from "lucide-react";
import SBoxOverlay from "./SBoxOverlay";
import CalculateIcon from "@mui/icons-material/Calculate";
import CalculatorOverlay from "./CalculatorOverlay";

function Navbar() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [sboxOpen, setSboxOpen] = React.useState(false);
  const [calcOpen, setCalcOpen] = React.useState(false);
  const { t, i18n } = useTranslation();

  const toggleLang = (lng) => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem('lng', lng);
    } catch (e) {}
    i18n.changeLanguage(lng);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#643fdc" }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", px: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link to="/">
                <Box
                  component="img"
                  src={import.meta.env.BASE_URL + "Logo.svg"}
                  alt="AES Learning & Training"
                  sx={{
                    height: { xs: "40px", sm: "50px", md: "55px" },
                    width: "auto",
                  }}
                />
              </Link>
            </Box>
            <Box
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              <Button
                component={Link}
                to="/step-by-step"
                onClick={() => {
                  if (location.pathname === "/step-by-step") {
                    window.dispatchEvent(new CustomEvent("stepbystep-reset"));
                  }
                }}
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor:
                    location.pathname === "/step-by-step"
                      ? "#7c5fe6"
                      : "inherit",
                }}
              >
                {t('nav.stepByStep')}
              </Button>
              <Button
                component={Link}
                to="/train"
                onClick={() => {
                  if (location.pathname === "/train") {
                    window.dispatchEvent(new CustomEvent("train-reset"));
                  }
                }}
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor:
                    location.pathname === "/train" ? "#7c5fe6" : "inherit",
                }}
              >
                {t('nav.training')}
              </Button>
              <Button
                component={Link}
                to="/LearnMore"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor:
                    location.pathname === "/LearnMore" ? "#7c5fe6" : "inherit",
                }}
              >
                {t('nav.learnMore')}
              </Button>
              {/* S-box Icon Button */}
              <Tooltip
                title="S-box"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: "14px",
                      p: "8px 10px",
                      backgroundColor: "#000000",
                    },
                  },
                }}
              >
                <IconButton
                  color="inherit"
                  sx={{ ml: 2 }}
                  onClick={() => setSboxOpen(true)}
                  aria-label={t('nav.sbox')}
                >
                  <Grid3x3 />
                </IconButton>
              </Tooltip>
              {/* Calculator Icon Button */}
              <Tooltip
                title={t('nav.calculator')}
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: "14px",
                      p: "8px 10px",
                      backgroundColor: "#000000",
                    },
                  },
                }}
              >
                <IconButton
                  color="inherit"
                  sx={{ ml: 1 }}
                  onClick={() => setCalcOpen(true)}
                  aria-label={t('nav.calculator')}
                >
                  <CalculateIcon />
                </IconButton>
              </Tooltip>
              {/* Language toggle */}
              <Button
                onClick={() => toggleLang(i18n.language === 'en' ? 'el' : 'en')}
                color="inherit"
                sx={{ ml: 1, minWidth: 60 }}
              >
                {i18n.language === 'en' ? 'EN' : 'EL'}
              </Button>
            </Box>
            {/* mobile: language button left of hamburger */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: 'center' }}>
              <Button
                onClick={() => toggleLang(i18n.language === 'en' ? 'el' : 'en')}
                color="inherit"
                sx={{ mr: 1, minWidth: 48, px: 1 }}
                aria-label="language"
              >
                {i18n.language === 'en' ? 'EN' : 'EL'}
              </Button>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  component={Link}
                  to="/step-by-step"
                  onClick={handleMenuClose}
                >
                  {t('nav.stepByStep')}
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/train"
                  onClick={() => {
                    if (location.pathname === "/train") {
                      window.dispatchEvent(new CustomEvent("train-reset"));
                    }
                    handleMenuClose();
                  }}
                >
                  {t('nav.training')}
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/LearnMore"
                  onClick={handleMenuClose}
                >
                  {t('nav.learnMore')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSboxOpen(true);
                    handleMenuClose();
                  }}
                >
                  {t('nav.sbox')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCalcOpen(true);
                    handleMenuClose();
                  }}
                >
                  {t('nav.calculator')}
                </MenuItem>
                {/* language toggle removed from hamburger menu (mobile button left of hamburger remains) */}
                {/* <MenuItem component={Link} to="/incremental" onClick={handleMenuClose}>Incremental</MenuItem> */}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* S-box Overlay */}
      <SBoxOverlay open={sboxOpen} onClose={() => setSboxOpen(false)} />
      <CalculatorOverlay open={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
}
export default Navbar;

import React from "react";
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
                <img
                  src={import.meta.env.BASE_URL + "Logo.svg"}
                  alt="AES Learning & Training"
                  style={{
                    height: "55px",
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
                Step-By-Step
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
                Training
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
                Learn More
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
                  aria-label="Show S-box"
                >
                  <Grid3x3 />
                </IconButton>
              </Tooltip>
              {/* Calculator Icon Button */}
              <Tooltip
                title="Calculator"
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
                  aria-label="Open calculator"
                >
                  <CalculateIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {/* ...mobile menu code unchanged... */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
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
                  StepByStep
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
                  Train
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/LearnMore"
                  onClick={handleMenuClose}
                >
                  Learn More
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSboxOpen(true);
                    handleMenuClose();
                  }}
                >
                  S-box
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCalcOpen(true);
                    handleMenuClose();
                  }}
                >
                  Calculator
                </MenuItem>
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

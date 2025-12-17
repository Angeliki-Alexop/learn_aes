import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
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
import CalculateIcon from '@mui/icons-material/Calculate';
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
              <img
                src={import.meta.env.BASE_URL + "Logo.svg"}
                alt="AES Learning & Training"
                style={{
                  height: "55px",
                  width: "auto",
                }}
              />
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              <Button
                component={Link}
                to="/step-by-step"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor: location.pathname === "/step-by-step" ? "#7c5fe6" : "inherit",
                }}
              >
                StepByStep
              </Button>
              <Button
                component={Link}
                to="/"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor: location.pathname === "/" ? "#7c5fe6" : "inherit",
                }}
              >
                Train
              </Button>
              <Button
                component={Link}
                to="/LearnMore"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor: location.pathname === "/LearnMore" ? "#7c5fe6" : "inherit",
                }}
              >
                Learn More
              </Button>
              <Button
                component={Link}
                to="/About"
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#7c5fe6" },
                  backgroundColor: location.pathname === "/About" ? "#7c5fe6" : "inherit",
                }}
              >
                About
              </Button>
              {/* S-box Icon Button */}
              <IconButton
                color="inherit"
                sx={{ ml: 2 }}
                onClick={() => setSboxOpen(true)}
                aria-label="Show S-box"
              >
                <Grid3x3 />
              </IconButton>
              {/* Calculator Icon Button */}
              <IconButton
                color="inherit"
                sx={{ ml: 1 }}
                onClick={() => setCalcOpen(true)}
                aria-label="Open calculator"
              >
                <CalculateIcon />
              </IconButton>
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
                <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                  Home
                </MenuItem>
                <MenuItem component={Link} to="/decode" onClick={handleMenuClose}>
                  Decode
                </MenuItem>
                <MenuItem component={Link} to="/encode" onClick={handleMenuClose}>
                  Encode
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/step-by-step"
                  onClick={handleMenuClose}
                >
                  StepByStep
                </MenuItem>
                <MenuItem onClick={() => { setSboxOpen(true); handleMenuClose(); }}>
                  S-box
                </MenuItem>
                <MenuItem onClick={() => { setCalcOpen(true); handleMenuClose(); }}>
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
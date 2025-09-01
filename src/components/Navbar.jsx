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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
function Navbar() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: "#643fdc" }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", px: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={import.meta.env.BASE_URL + "logo.png"} alt="Logo" style={{ height: 20 }} />
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              component={Link}
              to="/step-by-step"
              color="inherit"
              sx={{
                "&:hover": {
                  backgroundColor: "#7c5fe6",
                },
                backgroundColor:
                  location.pathname === "/step-by-step" ? "#7c5fe6" : "inherit",
              }}
            >
              StepByStep
            </Button>
            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{
                "&:hover": {
                  backgroundColor: "#7c5fe6",
                },
                backgroundColor:
                  location.pathname === "/" ? "#7c5fe6" : "inherit",
              }}
            >
              Train
            </Button>

            <Button
              component={Link}
              to="/LearnMore"
              color="inherit"
              sx={{
                "&:hover": {
                  backgroundColor: "#7c5fe6",
                },
                backgroundColor:
                  location.pathname === "/LearnMore" ? "#7c5fe6" : "inherit",
              }}
            >
              Learn More
            </Button>
            <Button
              component={Link}
              to="/About"
              color="inherit"
              sx={{
                "&:hover": {
                  backgroundColor: "#7c5fe6",
                },
                backgroundColor:
                  location.pathname === "/About" ? "#7c5fe6" : "inherit",
              }}
            >
              About
            </Button>

            {/* <Button component={Link} to="/incremental" color="inherit">Incremental</Button> */}
          </Box>
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
              {/* <MenuItem component={Link} to="/incremental" onClick={handleMenuClose}>Incremental</MenuItem> */}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;

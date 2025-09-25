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
import { Grid3x3 } from "lucide-react"; // Import the icon
import { sBox } from "../utils/aes_manual_v2"; // Import S-box


function SBoxOverlay({ open, onClose }) {
  const [selected, setSelected] = React.useState(null); // {row, col}

  const handleCellClick = (row, col) => {
    setSelected({ row, col });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      PaperProps={{
        sx: {
          width: 800,
          zIndex: 1300,
          padding: 3,
          background: "#fff",
        },
      }}
    >
      <Box>
        <Typography variant="h6" align="center" gutterBottom>
          AES S-box
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px", background: "#eee" }}></th>
                {Array.from({ length: 16 }, (_, i) => (
                  <th
                    key={i}
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      background:
                        selected && selected.col === i ? "#ffe082" : "#eee",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {i.toString(16).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, row) => (
                <tr key={row}>
                  <th
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      background:
                        selected && selected.row === row ? "#ffe082" : "#eee",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {row.toString(16).toUpperCase()}
                  </th>
                  {Array.from({ length: 16 }, (_, col) => {
                    const idx = row * 16 + col;
                    const isSelected =
                      selected && selected.row === row && selected.col === col;
                    const isRow =
                      selected && selected.row === row && !isSelected;
                    const isCol =
                      selected && selected.col === col && !isSelected;
                    return (
                      <td
                        key={col}
                        onClick={() => handleCellClick(row, col)}
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px",
                          textAlign: "center",
                          background: isSelected
                            ? "#ffd54f"
                            : isRow || isCol
                            ? "#fff9c4"
                            : "#f5f5f5",
                          fontFamily: "monospace",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        {sBox[idx].toString(16).padStart(2, "0").toUpperCase()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Drawer>
  );
}

function Navbar() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [sboxOpen, setSboxOpen] = React.useState(false); // Overlay state

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
              {/* ...existing buttons... */}
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
                {/* <MenuItem component={Link} to="/incremental" onClick={handleMenuClose}>Incremental</MenuItem> */}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* S-box Overlay */}
      <SBoxOverlay open={sboxOpen} onClose={() => setSboxOpen(false)} />
    </>
  );
}
export default Navbar;
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import "../css/navbar.scss";
import { NavLink } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate, useLocation } from "react-router-dom";
import menuicon from "../assets/menu.svg";
import { useAuth } from "./AuthManager/AuthContext";
import { getRecords, useApiMutation, type ResponseObj } from "../api/common";
import { logoutuser } from "../api/APIclass";

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;
const navItems = [{ label: "My Calendar", path: "calendar" }];
const signInItems = [
  { label: "Register", path: "register" },
  { label: "Sign In", path: "signin" },
];

export default function NavBar(props: Props) {
  const navigate = useNavigate();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHomePage, setHomepage] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const logoutSession = useApiMutation(getRecords(logoutuser),["userlogout"]);

  useEffect(() => {
    if (location.pathname === "/") {
      setHomepage(true);
    } else {
      setHomepage(false);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutSession.mutate({},{
      onSuccess: (data: ResponseObj<any>) => {
          navigate("/signin");
          handleClose();
          logout();
      }
    })
    
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography className="comp-logo-mobile">SPORTS ZONE</Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          user && 
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={NavLink}
              to={`/${item.path}`}
              className="navlink"
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav" className="myAppBar">
        <Toolbar className="tool-bar">
          <IconButton
            color="info"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="iconbutton-mobile"
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <img src={menuicon}></img>
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            className="company-name"
          >
            SPORTS ZONE
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              user && 
              <NavLink
                key={item.label}
                to={`/${item.path.toLowerCase()}`} // adjust route if needed
                className="navlink"
              >
                {({ isActive }) =>
                  !isHomePage && (
                    <Button
                      className={`menubutton ${isActive ? "active" : ""}`}
                    >
                      {item.label}
                    </Button>
                  )
                }
              </NavLink>
            ))}
          </Box>
          {isHomePage && (
            <div className="navigator-class">
              <button
                className="nav-cta"
                onClick={() => {
                  navigate("/signin");
                  setHomepage(false);
                }}
              >
                Book Now
              </button>
            </div>
          )}

          {user ? (
            <div className="logged-profile">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <span className="username-tag">Hi, {user?.firstname}</span>{" "}
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                keepMounted
                className="avatar-menu-dropdown"
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    overflow: "visible",
                    mt: -1,
                    minWidth: 180,
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 33,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
              >
                {user.isAdmin && (
                  <MenuItem className="menu-itemms">Dashboard</MenuItem>
                )}
                <MenuItem className="menu-itemms" onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            !isHomePage && (
              <div className="signIn">
                {signInItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={`/${item.path}`}
                    className="navlink"
                  >
                    {({ isActive }) => (
                      <Button
                        className={`menubutton ${isActive ? "active" : ""}`}
                      >
                        {item.label}
                      </Button>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          )}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "black",
              color: "white",
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

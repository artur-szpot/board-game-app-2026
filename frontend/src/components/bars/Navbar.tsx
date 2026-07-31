import { AppBar, Box, Button, Toolbar } from "@mui/material";
import type React from "react";
import { Link as RouterLink } from "react-router";

import {
    selectAccessToken,
    selectPermissions,
} from "../../store/features/currentUserSlice";
import { useAppSelector } from "../../store/hooks";

import "./bars.scss";

export const Navbar: React.FC = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);

  return (
    <AppBar position="static" color="primary" className="navbar">
      <Toolbar>
        <Box className="logo">
          <RouterLink to="/">
            <img src="/logo.png" alt="Logo placeholder" />
          </RouterLink>
        </Box>
        <Box className="nav-actions">
          {accessToken ? (
            <>
              {permissions?.some(
                permission => permission.permissionType === "ADMIN_PANEL",
              ) && (
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  color="inherit"
                >
                  Admin panel
                </Button>
              )}
              <Button component={RouterLink} to="/signout" color="inherit">
                Sign out
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/signin" color="inherit">
              Sign in
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

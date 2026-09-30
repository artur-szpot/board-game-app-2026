import { AppBar, Box, Button, MenuItem, Select, Toolbar } from "@mui/material";
import type React from "react";
import { Link as RouterLink } from "react-router";

import {
    selectAccessToken,
    selectPermissions,
} from "../../store/features/currentUserSlice";
import { resetToBottomFrame } from "../../store/features/frameStackSlice";
import {
    selectLanguage,
    setLanguage,
    SUPPORTED_LANGUAGES,
} from "../../store/features/settingsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { PermissionType } from "../../dto/user-data.dto";
import "./bars.scss";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const language = useAppSelector(selectLanguage);

  return (
    <AppBar position="static" color="primary" className="navbar">
      <Toolbar>
        <Box className="logo">
          <RouterLink to="/" onClick={() => dispatch(resetToBottomFrame())}>
            <img src="/logo.png" alt="Logo placeholder" />
          </RouterLink>
        </Box>
        <Box className="nav-actions">
          <Select
            size="small"
            variant="standard"
            value={language}
            onChange={event => dispatch(setLanguage(event.target.value))}
            inputProps={{ "aria-label": "Language" }}
            sx={{ color: "inherit", mr: 2 }}
          >
            {SUPPORTED_LANGUAGES.map(option => (
              <MenuItem key={option} value={option}>
                {option.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
          {accessToken ? (
            <>
              {permissions?.some(
                permission =>
                  permission.permissionType === PermissionType.ADMIN_PANEL,
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

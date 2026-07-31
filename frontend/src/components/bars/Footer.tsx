import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import type React from "react";

import "./bars.scss";

export const Footer: React.FC = () => {
  return (
    <AppBar
      position="static"
      color="primary"
      component="footer"
      className="footer"
    >
      <Toolbar>
        <Typography component="p" variant="body2" sx={{ flexGrow: 1 }}>
          Created by Artur Szpot for portfolio reasons
        </Typography>
        <Box>
          <IconButton
            component="a"
            href="https://github.com/artur-szpot"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.linkedin.com/in/szpotartur/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <LinkedInIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

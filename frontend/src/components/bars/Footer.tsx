import type React from "react"
import { Link } from "react-router"
import GitHubIcon from "@mui/icons-material/GitHub"
import LinkedInIcon from "@mui/icons-material/LinkedIn"

import "./bars.scss"

export const Footer: React.FC = () => {
  return (
    <div className="bar footer">
      <p>Created by Artur Szpot for portfolio reasons</p>
      <Link to={"https://github.com/artur-szpot"} target="_blank">
        <GitHubIcon />
      </Link>
      <Link to={"https://www.linkedin.com/in/szpotartur/"} target="_blank">
        <LinkedInIcon />
      </Link>
    </div>
  )
}

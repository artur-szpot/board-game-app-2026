import type React from "react"
import { Link } from "react-router"

import {
  selectAccessToken,
  selectPermissions,
} from "../../store/features/currentUserSlice"
import { useAppSelector } from "../../store/hooks"

import "./bars.scss"

export const Navbar: React.FC = () => {
  const accessToken = useAppSelector(selectAccessToken)
  const permissions = useAppSelector(selectPermissions)

  return (
    <div className="bar navbar">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt={"Logo placeholder"} />
        </Link>
      </div>
      {accessToken ? (
        <>
          {permissions?.some(
            permission => permission.permissionType === "ADMIN_PANEL",
          ) && <Link to={"/admin/users"}>Admin panel</Link>}
          <Link to={"/signout"}>Sign out</Link>
        </>
      ) : (
        <Link to={"/signin"}>Sign in</Link>
      )}
    </div>
  )
}

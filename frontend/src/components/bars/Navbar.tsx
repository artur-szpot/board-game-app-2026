import type React from "react"
import { Link } from "react-router"

import { selectAccessToken } from "../../store/features/currentUserSlice"
import { useAppSelector } from "../../store/hooks"

import "./bars.scss"

export const Navbar: React.FC = () => {
  const accessToken = useAppSelector(selectAccessToken)

  return (
    <div className="bar navbar">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt={"Logo placeholder"} />
        </Link>
      </div>
      <Link to={"/admin/users"}>Admin panel</Link>
      {accessToken ? (
        <Link to={"/signout"}>Sign out</Link>
      ) : (
        <Link to={"/signin"}>Sign in</Link>
      )}
    </div>
  )
}

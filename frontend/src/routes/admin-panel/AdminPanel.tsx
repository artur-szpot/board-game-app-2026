import type React from "react"
import { Link } from "react-router"

import "./admin-panel.scss"

export type AdminPanelCategory = "permissions" | "roles" | "users"

export type AdminPanelProps = {
  content?: AdminPanelCategory
}

export const AdminPanel: React.FC<AdminPanelProps> = (
  props: AdminPanelProps,
) => {
  const { content } = props
  const adminLink = (category: AdminPanelCategory) => {
    const active = content === category
    return (
      <Link
        to={active ? "" : `/admin/${category}`}
        className={active ? "active" : ""}
      >{`${category.charAt(0).toUpperCase()}${category.slice(1).toLowerCase()}`}</Link>
    )
  }
  const contentElement = ((_content?: AdminPanelCategory) => {
    switch (_content) {
      case "permissions":
      case "roles":
      case "users":
        return <div>{_content}</div>
      default:
        return <div>404</div>
    }
  })(content)
  return (
    <>
      <div className="admin-nav">
        <h3>Admin panel</h3>
        {adminLink("permissions")}
        {adminLink("roles")}
        {adminLink("users")}
      </div>
      <div className="admin-content">{contentElement}</div>
    </>
  )
}

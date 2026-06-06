import { BrowserRouter, Route, Routes } from "react-router"

import { Footer } from "./components/bars/Footer"
import { Navbar } from "./components/bars/Navbar"
import { AdminPanel } from "./routes/admin-panel/AdminPanel"
import { Dashboard } from "./routes/dashboard/Dashboard"
import { Signin } from "./routes/auth/Signin"
import { Signup } from "./routes/auth/Signup"

import "./css/index.scss"

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin">
            <Route
              path="permissions"
              element={<AdminPanel content="permissions" />}
            />
            <Route path="roles" element={<AdminPanel content="roles" />} />
            <Route path="users" element={<AdminPanel content="users" />} />
            <Route path="*" element={<AdminPanel />} />
          </Route>
          <Route path="*" element={<p>404!</p>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

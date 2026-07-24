import { BrowserRouter, Route, Routes } from "react-router"

import { Footer } from "./components/bars/Footer"
import { Navbar } from "./components/bars/Navbar"
import { GameDataType } from "./components/screens/selection-strategies"
import { AdminPanel } from "./routes/admin-panel/AdminPanel"
import { CollectionPanel } from "./routes/collection-panel/CollectionPanel"
import { Signin } from "./routes/auth/Signin"
import { Signup } from "./routes/auth/Signup"
import { Signout } from "./routes/auth/Signout"

import "./css/index.scss"

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route
            path="/"
            element={<CollectionPanel content={GameDataType.GAME} />}
          />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signout" element={<Signout />} />
          <Route path="/admin">
            <Route
              path="permissions"
              element={<AdminPanel content="permissions" />}
            />
            <Route path="roles" element={<AdminPanel content="roles" />} />
            <Route path="users" element={<AdminPanel content="users" />} />
            <Route path="*" element={<AdminPanel />} />
          </Route>
          <Route path="/collection">
            <Route
              path="games"
              element={<CollectionPanel content={GameDataType.GAME} />}
            />
            <Route
              path="tags"
              element={<CollectionPanel content={GameDataType.TAG} />}
            />
            <Route
              path="locations"
              element={<CollectionPanel content={GameDataType.LOCATION} />}
            />
            <Route
              path="helpers"
              element={<CollectionPanel content={GameDataType.HELPER} />}
            />
            <Route
              path="scoring-schemas"
              element={<CollectionPanel content={GameDataType.SCORING_SCHEMA} />}
            />
            <Route path="*" element={<CollectionPanel />} />
          </Route>
          <Route path="*" element={<p>404!</p>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

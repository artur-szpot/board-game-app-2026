import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import { Footer } from "./components/bars/Footer";
import { Navbar } from "./components/bars/Navbar";
import { GameDataType } from "./components/screens/selection-strategies";
import { AdminDataType } from "./routes/admin-panel/admin-data-type.enum";
import { AdminPanel } from "./routes/admin-panel/AdminPanel";
import { Signin } from "./routes/auth/Signin";
import { Signout } from "./routes/auth/Signout";
import { Signup } from "./routes/auth/Signup";
import { CollectionPanel } from "./routes/collection-panel/CollectionPanel";
import { GameDetails } from "./routes/game-details/GameDetails";
import { HelperRunner } from "./routes/helper-runner/HelperRunner";
import { LocationDetails } from "./routes/location-details/LocationDetails";
import { TagDetails } from "./routes/tag-details/TagDetails";
import { resetToBottomFrame } from "./store/features/frameStackSlice";
import { useAppDispatch } from "./store/hooks";

import "./css/index.scss";

const ResetFrameStackOnNavigation = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch, location.key]);

  return null;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ResetFrameStackOnNavigation />
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
              element={<AdminPanel content={AdminDataType.PERMISSION} />}
            />
            <Route
              path="roles"
              element={<AdminPanel content={AdminDataType.ROLE} />}
            />
            <Route
              path="users"
              element={<AdminPanel content={AdminDataType.USER} />}
            />
            <Route path="*" element={<AdminPanel />} />
          </Route>
          <Route path="/collection">
            <Route
              path="games"
              element={<CollectionPanel content={GameDataType.GAME} />}
            />
            <Route path="games/:id" element={<GameDetails />} />
            <Route
              path="tags"
              element={<CollectionPanel content={GameDataType.TAG} />}
            />
            <Route path="tags/:id" element={<TagDetails />} />
            <Route
              path="locations"
              element={<CollectionPanel content={GameDataType.LOCATION} />}
            />
            <Route path="locations/:id" element={<LocationDetails />} />
            <Route
              path="helpers"
              element={<CollectionPanel content={GameDataType.HELPER} />}
            />
            <Route path="helpers/:id" element={<HelperRunner />} />
            <Route
              path="sets"
              element={<CollectionPanel content={GameDataType.SET} />}
            />
            <Route
              path="scoring-schemas"
              element={
                <CollectionPanel content={GameDataType.SCORING_SCHEMA} />
              }
            />
            <Route path="*" element={<CollectionPanel />} />
          </Route>
          <Route path="*" element={<p>404!</p>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
};

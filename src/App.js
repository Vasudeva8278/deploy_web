import React, { useContext } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import NotAuthorized from "./components/NotAuthorized";
import Organizations from "./components/Organizations";
import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";
import { ProjectProvider } from "./context/ProjectContext";
import ResetPassword from "./components/Auth/ResetPassword";
import PasswordEmailResetSuccess from "./components/Auth/PasswordResetEmailSucces";
import VerifyEmail from "./components/Auth/VerifyEmail";
import LandingPage from "./pages/LandingPage.tsx";
import Header from "./components/Header";
import GoogleCallbackHandler from "./components/GoogleCallbackHandler";

const App = () => {
  const { token } = useContext(AuthContext);
  const isAuthenticated = !!token;

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/projects" />
              ) : (
                <>
                  <Header />
                  <LandingPage />
                </>
              )
            }
          />
          <Route
            path='/login'
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path='/signup'
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path='/verifyEmail'
            element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            }
          />
          <Route
            path='/resetPassword'
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path='/forgotPassword'
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path='/resetEmailSuccess'
            element={
              <PublicRoute>
                <PasswordEmailResetSuccess />
              </PublicRoute>
            }
          />
          <Route
            path='/organizations'
            element={
              <PrivateRoute allowedRoles={["SuperAdmin"]}>
                <Organizations />
              </PrivateRoute>
            }
          />
          <Route path='/not-authorized' element={<NotAuthorized />} />
          <Route
            path='/*'
            element={isAuthenticated ? (
              <ProjectProvider>
                <Home />
              </ProjectProvider>
            ) : (
              <Navigate to="/" />
            )}
          />
          <Route path="/google/callback" element={<GoogleCallbackHandler />} />
        </Routes>
      </div>
    </Router>
  );
};

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  return user ? <Navigate to='/projects' /> : children;
};

export default App;

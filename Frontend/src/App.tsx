import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NavBar from "./pages/navbar/navbar";
import Dashboard from "./pages/dashboard/dashboard";
import Portfolio from "./pages/portfolio/portfolio";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import { About } from "./pages/about/about";
import Leagues from "./pages/leagues/leagues";
import PortfolioPerformance from "./pages/portfolio/portfolioPerformance";
import ProtectedRoute from "./components/protectedRoute";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <>
            <NavBar />
            <div className="min-h-screen">
              <Outlet />
            </div>
          </>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: "portfolio",
            element: <Portfolio />
          },
          {
            path: "portfolio/:id/performance",
            element: <PortfolioPerformance />
          },
          {
            path: "leagues",
            element: <Leagues />,
          },
          {
            path: "about",
            element: <About />,
          },
        ]
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>

  );
}

export default App;

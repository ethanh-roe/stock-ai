import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NavBar from "./pages/navbar/navbar";
import Dashboard from "./pages/dashboard/dashboard";
import Portfolio from "./pages/portfolio/portfolio"
import Login from "./pages/login/login";
import Register from "./pages/register/register"

const router = createBrowserRouter([
  // Public
  {
    path:"/login",
    element: <Login />
  },

  {
    path: "/register",
    element: <Register />
  },

  // Will be protected, only accessible after loggin in.
  {
    path:"/",
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
        index: true,
        path: "portfolio",
        element: <Portfolio />
      }
    ]
  }
]);

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App

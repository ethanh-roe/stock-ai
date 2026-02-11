import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NavBar from "./pages/navbar/navbar";
import Dashboard from "./pages/dashboard/dashboard";
import Portfolio from "./pages/portfolio/portfolio"
import Login from "./pages/login/login";

const router = createBrowserRouter([
  // Public
  {
    path:"/",
    element: <Login />
  },

  // Will be protected, only accessible after loggin in.
  {
    path:"/app",
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

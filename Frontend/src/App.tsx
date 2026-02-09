import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NavBar from "./pages/navbar/navbar";
import Dashboard from "./pages/dashboard/dashboard";

const router = createBrowserRouter([{
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
  ]
}]);

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App

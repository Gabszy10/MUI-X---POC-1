import "./App.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MobileAppLayout from "./layouts/MobileAppLayout";
import History from "./pages/History";
import LogSet from "./pages/LogSet";
import Settings from "./pages/Settings";
import Today from "./pages/Today";
import appTheme from "./theme";

function ExerciseRoute() {
  const params = useParams();

  return <LogSet key={params.id ?? "exercise"} />;
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route element={<MobileAppLayout />}>
              <Route index element={<Today />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="exercise/:id" element={<ExerciseRoute />} />
            </Route>
          </Routes>
          <ToastContainer
            position="bottom-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            pauseOnHover
            theme="dark"
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

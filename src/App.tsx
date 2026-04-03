import "./App.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MobileAppLayout from "./layouts/MobileAppLayout";
import ExerciseCategory from "./pages/ExerciseCategory";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import LogSet from "./pages/LogSet";
import Settings from "./pages/Settings";
import Today from "./pages/Today";
import Timer from "./pages/Timer";
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
              <Route path="timer" element={<Timer />} />
              <Route path="settings" element={<Settings />} />
              <Route path="library" element={<ExerciseLibrary />} />
              <Route path="library/:type" element={<ExerciseCategory />} />
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

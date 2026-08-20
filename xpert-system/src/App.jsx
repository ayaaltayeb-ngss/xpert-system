import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8f7fb]">

        <Sidebar />

        <div className="ml-56">


          <main className="p-6">
            <Routes>

              <Route
                path="/"
                element={<Analytics />}
              />

       

              <Route
                path="/prediction"
                element={<Prediction />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
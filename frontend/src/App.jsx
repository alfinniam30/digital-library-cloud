import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import Borrowings from "./pages/Borrowings";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/books"
          element={
            <PrivateRoute>
              <Books />
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowings"
          element={
            <PrivateRoute>
              <Borrowings />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
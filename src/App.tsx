import "./css/App.scss";
import NavBar from "./components/NavBar";
import { Route, Routes, Navigate } from "react-router-dom";
import MobiScrollCalendar from "./components/ResponsiveCalender";
import SignIn from "./components/SigninComponent";
import Register from "./components/RegisterComponent";
import Home from "./components/HomeComponent";
import ProtectedRoute from "./components/AuthManager/ProtectedRoute";
import MyBooking from "./components/MyBookingComponent";

function App() {
  return (
    <>
      <NavBar></NavBar>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/calendar" element={ <ProtectedRoute><MobiScrollCalendar /></ProtectedRoute>}></Route>
          <Route path="/signin" element={<SignIn />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/mybookings" element={<MyBooking />}></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

import "./css/App.css";
import NavBar from "./components/NavBar";
import { Route, Routes } from "react-router-dom";
import MobiScrollCalendar from "./components/ResponsiveCalender";
import SignIn from "./components/SigninComponent";
import Register from "./components/RegisterComponent";
import Home from "./components/HomeComponent";

function App() {
  return (
    <>
      <NavBar></NavBar>
      <main className="main-container">
        <Routes>
          <Route path="/calendar" element={<MobiScrollCalendar />}></Route>
          <Route path="/signin" element={<SignIn />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/" element={<Home />}></Route>
        </Routes>
      </main>
    </>
  );
}

export default App;

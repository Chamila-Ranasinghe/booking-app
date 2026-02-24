import "./css/App.css";
import NavBar from "./components/NavBar";
import { Route, Routes } from "react-router-dom";
import MobiScrollCalendar from "./components/ResponsiveCalender";

function App() {
  return (
    <>
      <NavBar></NavBar>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MobiScrollCalendar />}></Route>
        </Routes>
      </main>
    </>
  );
}

export default App;

// src/App.jsx
import { Navigate } from "react-router-dom";
import ManagePackage from "./pages/ManagePackage";

function App() {
  return (
    <div className="app-container">
      <h1>Welcome to Nurse Management System</h1>
      <p>Please select a menu item from the sidebar to get started.</p>
    </div>
  );
}

export default App;

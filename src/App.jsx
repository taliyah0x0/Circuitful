import { HashRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import WorkspacePage from "./pages/WorkspacePage.jsx";
import PartEditorPage from "./pages/PartEditorPage.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/part-editor" element={<PartEditorPage />} />
        <Route path="/part-editor/:partId" element={<PartEditorPage />} />
      </Routes>
    </HashRouter>
  );
}

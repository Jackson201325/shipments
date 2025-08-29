// frontend/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ShipmentsPage } from "./pages/ShipmentsPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/shipments" replace />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </Layout>
  );
}

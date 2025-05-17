import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Dashboard from "./pages/Dashboard.tsx"
import SettingsPage from "./pages/Settings.tsx"
import Login from "@/pages/Login.tsx"
import NotFound from "@/pages/NotFound.tsx" // Import the new NotFound page
import { AuthProvider } from "./contexts/AuthContext"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/protected-route.tsx"

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="*" element={<NotFound />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </>
    )
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
)

// import "./App.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar.tsx"
import { ThemeProvider } from "@/components/theme-provider"
import { HomePage } from "@/components/home-page"

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <SidebarProvider>
                    <AppSidebar collapsible={"none"} />
                    <main className="ml-[var(--sidebar-width)] p-6 min-h-screen w-full">
                        <HomePage />
                    </main>
                </SidebarProvider>
            </ThemeProvider>
        </>
    )
}

export default App

import {SignupForm} from "@/components/signup-form"
import {ThemeProvider} from "@/components/theme-provider.tsx"

export default function Signup() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <SignupForm/>
                </div>
            </div>
        </ThemeProvider>
    )
}
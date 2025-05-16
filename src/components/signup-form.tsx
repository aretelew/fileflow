import React, {useState} from "react";
import {createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {auth} from "@/firebase.tsx";
import {useNavigate} from "react-router-dom";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {z} from "zod";
import { LoginForm } from "./login-form";

// Form validation schema
const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function SignupForm({
                               className,
                               ...props
                           }: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);

    if (showLogin) {
        return <LoginForm />;
    }

    const validateForm = () => {
        try {
            signupSchema.parse({email, password, confirmPassword});
            setValidationErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                err.errors.forEach((error) => {
                    if (error.path) {
                        errors[error.path[0]] = error.message;
                    }
                });
                setValidationErrors(errors);
            }
            return false;
        }
    };

    const handleEmailPasswordSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered with email/password");
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
            console.error("Error registering with email/password:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError(null);
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            console.log("User registered with Google");
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
            console.error("Error registering with Google:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create an account</CardTitle>
                    <CardDescription>
                        Sign up with Google account or use email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <form onSubmit={handleEmailPasswordSignup}>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full cursor-pointer"
                                    onClick={handleGoogleSignup}
                                    type="button"
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                         className="mr-2 h-4 w-4">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Sign up with Google
                                </Button>
                            </div>
                            <div
                                className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className={validationErrors.email ? "border-red-500" : ""}
                                    />
                                    {validationErrors.email && (
                                        <p className="text-red-500 text-sm">{validationErrors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className={validationErrors.password ? "border-red-500" : ""}
                                    />
                                    {validationErrors.password && (
                                        <p className="text-red-500 text-sm">{validationErrors.password}</p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        className={validationErrors.confirmPassword ? "border-red-500" : ""}
                                    />
                                    {validationErrors.confirmPassword && (
                                        <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                                    {loading ? "Creating account..." : "Create account"}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <button onClick={() => setShowLogin(true)}
                                    className="underline underline-offset-4 cursor-pointer">
                                    Log in
                                </button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

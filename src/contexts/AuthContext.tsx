import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User as FirebaseUser, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import {auth} from '@/firebase.tsx';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    firebaseUser: FirebaseUser | null; // Store the raw Firebase user if needed
    token: string | null;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    handleFirebaseUser: (fbUser: FirebaseUser | null) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    reauthenticateAndDeleteUser: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    firebaseUser: null,
    token: null,
    isLoading: true, // Start with loading true until Firebase auth state is determined
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [authState, setAuthState] = useState<AuthState>(initialAuthState);

    // Effect to listen for Firebase authentication state changes
    useEffect(() => {
        setAuthState(prev => ({...prev, isLoading: true}));
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                // User is signed in
                try {
                    const idToken = await fbUser.getIdToken();
                    const appUser: User = {
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName,
                        photoURL: fbUser.photoURL,
                    };

                    localStorage.setItem('authToken', idToken);
                    localStorage.setItem('authUser', JSON.stringify(appUser)); // Store your app-specific user object

                    setAuthState({
                        isAuthenticated: true,
                        user: appUser,
                        firebaseUser: fbUser,
                        token: idToken,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("Error getting ID token or setting auth state:", error);
                    // Handle error, perhaps by signing the user out locally
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    setAuthState({
                        ...initialAuthState,
                        isLoading: false,
                    });
                }
            } else {
                // User is signed out
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setAuthState({
                    ...initialAuthState,
                    isLoading: false,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const handleFirebaseUser = async (fbUser: FirebaseUser | null): Promise<void> => {
        setAuthState(prev => ({...prev, isLoading: true}));
        if (fbUser) {
            try {
                const idToken = await fbUser.getIdToken();
                const appUser: User = {
                    uid: fbUser.uid,
                    email: fbUser.email,
                    displayName: fbUser.displayName,
                    photoURL: fbUser.photoURL,
                };
                localStorage.setItem('authToken', idToken);
                localStorage.setItem('authUser', JSON.stringify(appUser));
                setAuthState({
                    isAuthenticated: true,
                    user: appUser,
                    firebaseUser: fbUser,
                    token: idToken,
                    isLoading: false,
                });
            } catch (error) {
                console.error("Error processing Firebase user:", error);
                // Fallback to logged out state on error
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setAuthState({...initialAuthState, isLoading: false});
            }
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setAuthState({...initialAuthState, isLoading: false});
        }
    };

    const logout = async (): Promise<void> => {
        setAuthState(prev => ({...prev, isLoading: true}));
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            setAuthState(prev => ({...prev, isLoading: false}));
        }
    };

    const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
        if (!auth.currentUser) throw new Error("User not authenticated");
        try {
            await updateProfile(auth.currentUser, updates);
            if (updates.displayName) {
                setAuthState(prev => prev.user ? {...prev, user: {...prev.user, displayName: updates.displayName || prev.user.displayName}} : prev);
            }
            if (updates.photoURL) {
                setAuthState(prev => prev.user ? {...prev, user: {...prev.user, photoURL: updates.photoURL || prev.user.photoURL}} : prev);
            }
            console.log("Profile update successful (placeholder)", updates);
        } catch (error) {
            console.error("Error updating profile (placeholder):", error);
            throw error;
        }
    };

    const sendPasswordReset = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Password reset email sent (placeholder) to", email);
        } catch (error) {
            console.error("Error sending password reset email (placeholder):", error);
            throw error;
        }
    };

    const reauthenticateAndDeleteUser = async (password: string) => {
        if (!auth.currentUser || !auth.currentUser.email) throw new Error("User not authenticated or email not available");
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await deleteUser(auth.currentUser);
            console.log("User reauthenticated and deleted (placeholder)");
        } catch (error) {
            console.error("Error reauthenticating or deleting user (placeholder):", error);
            throw error;
        }
    };

    const contextValue: AuthContextType = {
        ...authState,
        handleFirebaseUser,
        logout,
        updateUserProfile,
        sendPasswordReset,
        reauthenticateAndDeleteUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User as FirebaseUser, onAuthStateChanged, signOut} from 'firebase/auth';
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
            setAuthState(prev => ({...prev, isLoading: false})); // Ensure loading is false even on error
        }
    };

    const contextValue: AuthContextType = {
        ...authState,
        handleFirebaseUser,
        logout,
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

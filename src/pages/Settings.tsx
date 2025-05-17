import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { storage, storageRef } from "@/firebase";
import { listAll, getMetadata } from "firebase/storage";
import { Moon, Sun, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUserProfile, sendPasswordReset, reauthenticateAndDeleteUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [theme, setTheme] = useState('system');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [filesPerPage, setFilesPerPage] = useState('10');
  const [currentPassword, setCurrentPassword] = useState('');
  const [storageUsage, setStorageUsage] = useState(0);
  const [storageLimit, setStorageLimit] = useState(5 * 1024 * 1024 * 1024); // 5GB default limit
  const [isLoading, setIsLoading] = useState(false);

  // Calculate storage usage
  useEffect(() => {
    if (!user) return;
    
    const calculateStorageUsage = async () => {
      try {
        const userFilesPath = `users/${user.uid}/files`;
        const listRef = storageRef(storage, userFilesPath);
        const res = await listAll(listRef);
        
        let totalSize = 0;
        for (const itemRef of res.items) {
          try {
            const metadata = await getMetadata(itemRef);
            totalSize += metadata.size;
          } catch (error) {
            console.error("Error getting metadata:", error);
          }
        }
        
        setStorageUsage(totalSize);
      } catch (error) {
        console.error("Error calculating storage usage:", error);
      }
    };
    
    calculateStorageUsage();
  }, [user]);

  // Handle save profile changes
  const handleProfileSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile({ displayName });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      await sendPasswordReset(user.email);
      toast.success("Password reset email sent", { 
        description: "Please check your inbox"
      });
    } catch (error) {
      console.error("Failed to send password reset:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    setIsLoading(true);
    try {
      await reauthenticateAndDeleteUser(currentPassword);
      toast.success("Account deleted successfully");
      // Redirect would happen automatically due to auth state change
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account", { 
        description: "Please check your password and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save app settings
  const handleSaveSettings = () => {
    // In a real app, these would be saved to a database or user preferences
    localStorage.setItem('theme', theme);
    localStorage.setItem('sortOrder', sortOrder);
    localStorage.setItem('filesPerPage', filesPerPage);
    
    toast.success("Settings saved successfully");
  };

  // Load saved settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedSortOrder = localStorage.getItem('sortOrder');
    const savedFilesPerPage = localStorage.getItem('filesPerPage');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedSortOrder) setSortOrder(savedSortOrder);
    if (savedFilesPerPage) setFilesPerPage(savedFilesPerPage);
  }, []);

  // Format bytes to readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (storageUsage / storageLimit) * 100;

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-8 p-8 pt-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>

              <Separator />

              {/* Application Settings */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Application Settings</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how FileFlow looks and works.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Theme</SelectLabel>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sort">Default Sort Order</Label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                          <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sort Order</SelectLabel>
                            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                            <SelectItem value="date_desc">Newest First</SelectItem>
                            <SelectItem value="date_asc">Oldest First</SelectItem>
                            <SelectItem value="size_desc">Largest First</SelectItem>
                            <SelectItem value="size_asc">Smallest First</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="perPage">Files Per Page</Label>
                      <Select value={filesPerPage} onValueChange={setFilesPerPage}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                          <SelectValue placeholder="Select number of files" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Files Per Page</SelectLabel>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveSettings}>Save Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                    <CardDescription>
                      Monitor your storage usage across FileFlow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-center py-4">
                      <div className="relative h-48 w-48">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            className="stroke-muted-foreground/20"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="10"
                          />
                          {/* Progress circle with stroke-dasharray trick */}
                          <circle
                            className="stroke-primary"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${storagePercentage * 2.51} 1000`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-bold">{storagePercentage.toFixed(1)}%</span>
                          <span className="text-sm text-muted-foreground">{formatBytes(storageUsage)} / {formatBytes(storageLimit)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Profile Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Profile</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Your email address cannot be changed.
                      </p>
                    </div>

                    <Button onClick={handleProfileSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your password and account security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <p className="text-sm text-muted-foreground">
                        Reset your password by sending a password reset link to your email.
                      </p>
                      <Button
                        onClick={handlePasswordReset}
                        variant="outline"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Password Reset Link"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 py-4">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter your current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteAccount();
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
} 
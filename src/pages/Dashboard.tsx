import { useState, useCallback, useEffect } from "react";
import { FileUploader } from "../components/file-uploader";
import { FileList } from "../components/file-list";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { storage, storageRef } from "@/firebase"; // Assuming firebase.tsx is in a 'firebase' or similar folder at root or in 'src'
import { uploadBytesResumable, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext.tsx"; // To get the current user for path creation
import { v4 as uuidv4 } from 'uuid';

export interface FileItem {
    id: string; // Can be Firebase's internal ID or your UUID
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
    url: string;
    progress?: number;
    file?: File;
    fullPath?: string;
}

function Dashboard() {
    const { user } = useAuth(); // Get the authenticated user
    const [files, setFiles] = useState<FileItem[]>([]);
    const [pendingFiles, setPendingFiles] = useState<FileItem[]>([]);

    // Helper function to get user-specific storage path
    const getUserStoragePath = useCallback(() => {
        if (!user) return 'shared-files';
        return `users/${user.uid}/files`;
    }, [user]);

    // Load files from Firebase Storage on component mount
    const loadFilesFromFirebase = useCallback(async () => {
        if (!user) return;
        const userFilesPath = getUserStoragePath();
        const listRef = storageRef(storage, userFilesPath);
        try {
            const res = await listAll(listRef);
            const fetchedFilesPromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return {
                    id: itemRef.name,
                    name: itemRef.name,
                    url: url,
                    fullPath: itemRef.fullPath,
                    size: 0,
                    type: '',
                    uploadDate: new Date(),
                };
            });
            const fetchedFiles = await Promise.all(fetchedFilesPromises);
            setFiles(fetchedFiles as FileItem[]);
        } catch (error) {
            console.error("Error loading files from Firebase Storage:", error);
        }
    }, [user, getUserStoragePath]);


    useEffect(() => {
        if (user) {
            loadFilesFromFirebase();
        }
    }, [user, loadFilesFromFirebase]);


    // Handle files selected for upload (remains the same)
    const handleFilesPending = useCallback((newFiles: FileItem[]) => {
        setPendingFiles((prev) => [...newFiles, ...prev]);
    }, []);


    const actualFileUpload = (fileItem: FileItem) => {
        if (!fileItem.file || !user) {
            console.error("File or user not available for upload", fileItem);



            setPendingFiles(prev =>
                prev.map(f =>
                    f.id === fileItem.id
                        ? { ...f, progress: 0, error: "File or user not available" } // Add an error property
                        : f
                )
            );
            return;
        }

        const userFilesPath = getUserStoragePath();

        // Generate a unique filename if duplicates exist in the current files (Firebase database)
        const originalName = fileItem.file.name;
        const dotIndex = originalName.lastIndexOf(".");
        const baseName = dotIndex === -1 ? originalName : originalName.slice(0, dotIndex);
        const extension = dotIndex === -1 ? "" : originalName.slice(dotIndex);
        const existingNames = [...files, ...pendingFiles.filter(f => f.id !== fileItem.id)].map(f => f.name);
        let newFileName = originalName;
        const matchingCount = existingNames.filter(name => {
            if (name === originalName) return true;
            const regex = new RegExp(`^${baseName} \\(\\d+\\)${extension}$`);
            return regex.test(name);
        }).length;
        if (matchingCount > 0) {
            newFileName = `${baseName} (${matchingCount})${extension}`;
        }

        const fileRef = storageRef(storage, `${userFilesPath}/${newFileName}`);
        const uploadTask = uploadBytesResumable(fileRef, fileItem.file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setPendingFiles(prev =>
                    prev.map(f =>
                        f.id === fileItem.id ? { ...f, progress: progress } : f
                    )
                );
            },
            (error) => {
                console.error("Upload failed for", fileItem.name, error);
                setPendingFiles(prev =>
                    prev.map(f =>
                        f.id === fileItem.id ? { ...f, progress: 0, error: error.message } : f
                    )
                );
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const newUploadedFile: FileItem = {
                        ...fileItem,
                        name: newFileName,
                        url: downloadURL,
                        fullPath: uploadTask.snapshot.ref.fullPath,
                        progress: undefined,
                        file: undefined,
                        uploadDate: new Date(),
                    };
                    setFiles(prev => [newUploadedFile, ...prev]);
                    setPendingFiles(prev => prev.filter(f => f.id !== fileItem.id));
                } catch (error) {
                    console.error("Error getting download URL for", fileItem.name, error);
                    setPendingFiles(prev =>
                        prev.map(f =>
                            f.id === fileItem.id ? { ...f, progress: 0, error: "Failed to get download URL" } : f
                        )
                    );
                }
            }
        );
        return uploadTask;
    };

    const handleUploadPending = useCallback(() => {
        if (!user) {
            alert("You must be logged in to upload files.");
            return;
        }

        const pendingFileIDs = pendingFiles.map(fileItem => fileItem.id);
        const duplicates = pendingFileIDs.filter((item, index) => pendingFileIDs.indexOf(item) !== index);
        console.error("PENDING FILES", pendingFiles);
        console.error("DUPLICATES", duplicates);

        pendingFiles.forEach(fileItem => {
            if (fileItem.file) {
                actualFileUpload(fileItem);
            }
        });
    }, [pendingFiles, user, getUserStoragePath]);


    const handleDeleteFile = useCallback(async (fileId: string) => {
        const fileToDelete = files.find(f => f.id === fileId) || pendingFiles.find(f => f.id === fileId);
        if (!fileToDelete || !fileToDelete.fullPath) {
            console.error("File path not found for deletion", fileToDelete);
            // Fallback: remove from local state if no fullPath (e.g., a pending file that never started upload)
            setFiles((prev) => prev.filter((file) => file.id !== fileId));
            setPendingFiles((prev) => prev.filter((file) => file.id !== fileId));
            return;
        }

        const fileRef = storageRef(storage, fileToDelete.fullPath);
        try {
            await deleteObject(fileRef);
            setFiles((prev) => prev.filter((file) => file.id !== fileId));
            console.log("File deleted successfully from Firebase Storage");
        } catch (error) {
            console.error("Error deleting file from Firebase Storage:", error);
        }
    }, [files, pendingFiles]);


    const handleDeletePendingFile = useCallback((id: string) => {
        setPendingFiles((prev) => prev.filter((file) => file.id !== id));
    }, []);


    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <SidebarProvider>
                    <AppSidebar collapsible={"none"} />
                    <main className="ml-[var(--sidebar-width)] p-6 min-h-screen w-full">
                        <div className="w-full">
                            <section>
                                <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
                                <p className="text-muted-foreground mb-6">Upload, manage, and organize your
                                    files in one place.</p>
                            </section>

                            <div className="flex flex-row gap-6">
                                <Card className="w-[50%]">
                                    <CardHeader>
                                        <CardTitle>Upload Files</CardTitle>
                                        <CardDescription>Drag and drop files here or click to browse</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        {/* onFilesUploaded from FileUploader is now handleFilesPending */}
                                        <FileUploader onFilesUploaded={handleFilesPending} />
                                    </CardContent>
                                </Card>
                                <Card className="w-[50%]">
                                    <CardHeader>
                                        <CardTitle>Pending Files</CardTitle>
                                        <CardDescription>Files ready to be uploaded</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px] flex flex-col">
                                        <div className="flex-1 overflow-auto mb-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Size</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pendingFiles.map((file) => (
                                                        <TableRow key={file.id}>
                                                            <TableCell>{file.name}</TableCell>
                                                            <TableCell>{file.file ? (file.file.size / 1024).toFixed(2) : 'N/A'} KB</TableCell>
                                                            <TableCell>
                                                                {file.progress !== undefined && (
                                                                    <Progress value={file.progress} className="h-2" />
                                                                )}

                                                                {file.error && <span className="text-xs text-red-500">{file.error}</span>}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 cursor-pointer"
                                                                    onClick={() => handleDeletePendingFile(file.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {pendingFiles.length > 0 && (
                                            <div className="flex flex-row gap-2 w-full">
                                                <Button
                                                    className="cursor-pointer w-[60%]"
                                                    onClick={handleUploadPending} // This now triggers actual Firebase uploads
                                                >
                                                    Upload {pendingFiles.length} File(s)
                                                </Button>
                                                <Button
                                                    className="cursor-pointer w-[40%]"
                                                    variant="outline"
                                                    onClick={() => setPendingFiles([])} // Clear pending files
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Separator className="my-8 w-full" />

                        <div>
                            <section>
                                <h2 className="text-2xl font-semibold mb-6">Your Files</h2>
                                <FileList
                                    files={files}
                                    onDeleteFile={handleDeleteFile}
                                />
                            </section>
                        </div>
                    </main>
                </SidebarProvider>
            </ThemeProvider>
        </>
    );
}

export default Dashboard;

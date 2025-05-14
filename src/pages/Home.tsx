import {useState, useCallback, useEffect} from "react"
import {FileUploader} from "../components/file-uploader.tsx"
import {FileList} from "../components/file-list.tsx"
import {Separator} from "@/components/ui/separator.tsx"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {X} from "lucide-react"
import {Progress} from "@/components/ui/progress"

export interface FileItem {
    id: string
    name: string
    size: number
    type: string
    uploadDate: Date
    url: string
    progress?: number
    file?: File
}

function Home() {
    // State for managing files
    const [files, setFiles] = useState<FileItem[]>([])
    const [pendingFiles, setPendingFiles] = useState<FileItem[]>([])

    // Load files from localStorage on component mount
    useEffect(() => {
        const savedFiles = localStorage.getItem("uploadedFiles")
        if (savedFiles) {
            try {
                // Parse the dates properly when loading from localStorage
                const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
                    ...file,
                    uploadDate: new Date(file.uploadDate),
                }))
                setFiles(parsedFiles)
            } catch (error) {
                console.error("Error loading files from localStorage:", error)
            }
        }
    }, [])

    // Save files to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("uploadedFiles", JSON.stringify(files))
    }, [files])

    // Handle file upload
    const handleFilesUploaded = useCallback((newFiles: FileItem[]) => {
        setFiles((prev) => [...newFiles, ...prev])
    }, [])

    // Handle files selected for upload
    const handleFilesPending = useCallback((newFiles: FileItem[]) => {
        setPendingFiles((prev) => [...newFiles, ...prev])
    }, [])

    const simulateFileUpload = (file: FileItem) => {
        let progress = 0
        const interval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 30, 100)
            
            setPendingFiles(prev =>
                prev.map(f => 
                    f.id === file.id 
                        ? { ...f, progress: Math.round(progress) } 
                        : f
                )
            )

            if (progress >= 100) {
                clearInterval(interval)
                // Remove from pending and add to completed files after a small delay
                setTimeout(() => {
                    setPendingFiles(prev => prev.filter(f => f.id !== file.id))
                    setFiles(prev => [{...file, progress: undefined}, ...prev])
                }, 200)
            }
        }, 100)

        // Store the interval ID for cleanup
        return interval
    }

    // Handle upload of pending files
    const handleUploadPending = useCallback(() => {
        const intervals = pendingFiles.map(file => simulateFileUpload(file))
        
        // Cleanup function to clear any remaining intervals
        return () => intervals.forEach(clearInterval)
    }, [pendingFiles])

    // Handle file deletion
    const handleDeleteFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id))
    }, [])

    // Handle pending file deletion
    const handleDeletePendingFile = useCallback((id: string) => {
        setPendingFiles((prev) => prev.filter((file) => file.id !== id))
    }, [])

    // Handle file edit
    const handleEditFile = useCallback((id: string, newName: string) => {
        setFiles(prev => prev.map(file => 
            file.id === id 
                ? { ...file, name: newName }
                : file
        ))
    }, [])

    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <SidebarProvider>
                    <AppSidebar collapsible={"none"}/>
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
                                        <FileUploader onFilesUploaded={handleFilesPending}/>
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
                                                            <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                                                            <TableCell>
                                                                {file.progress !== undefined && (
                                                                    <Progress value={file.progress} className="h-2" />
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 cursor-pointer"
                                                                    onClick={() => handleDeletePendingFile(file.id)}
                                                                >
                                                                    <X className="h-4 w-4"/>
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
                                                    onClick={handleUploadPending}
                                                >
                                                    Upload {pendingFiles.length} File(s)
                                                </Button>
                                                <Button
                                                    className="cursor-pointer w-[40%]"
                                                    variant="outline"
                                                    onClick={handleUploadPending}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Separator className="my-8 w-full"/>

                        <div>
                            <section>
                                <h2 className="text-2xl font-semibold mb-6">Your Files</h2>
                                <FileList 
                                    files={files} 
                                    onDeleteFile={handleDeleteFile} 
                                    onEditFile={handleEditFile}
                                />
                            </section>
                        </div>
                    </main>
                </SidebarProvider>
            </ThemeProvider>
        </>
    )
}

export default Home

import {useState, useCallback, useEffect} from "react"
import {FileUploader} from "./file-uploader"
import {FileList} from "./file-list"
import {Separator} from "@/components/ui/separator"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"

export interface FileItem {
    id: string
    name: string
    size: number
    type: string
    uploadDate: Date
    url: string
}

export function HomePage() {
    // State for managing files
    const [files, setFiles] = useState<FileItem[]>([])

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

    // Handle file deletion
    const handleDeleteFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id))
    }, [])

    return (
        <>
            <div className="w-full">
                <section>
                    <h1 className="text-3xl font-bold tracking-tight mb-4 text-center">File Management</h1>
                    <p className="text-muted-foreground mb-6 text-center">Upload, manage, and organize your files in one place.</p>
                </section>

                <Card className="max-w-2xl ml-auto mr-auto">
                    <CardHeader>
                        <CardTitle>Upload Files</CardTitle>
                        <CardDescription>Drag and drop files here or click to browse</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUploader onFilesUploaded={handleFilesUploaded}/>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-8 w-full"/>

            <div>
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Your Files</h2>
                    <FileList files={files} onDeleteFile={handleDeleteFile}/>
                </section>
            </div>
        </>
    )
}

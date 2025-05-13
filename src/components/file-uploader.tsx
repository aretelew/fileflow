"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import type { FileItem } from "./home-page"
import { Upload, File, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

interface FileUploaderProps {
    onFilesUploaded: (files: FileItem[]) => void
}

interface UploadingFile {
    file: File
    progress: number
    id: string
}

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const [isUploading, setIsUploading] = useState(false)

    // Handle file drop
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Create uploading file objects with 0 progress
            const newUploadingFiles = acceptedFiles.map((file) => ({
                file,
                progress: 0,
                id: uuidv4(),
            }))

            setUploadingFiles((prev) => [...prev, ...newUploadingFiles])
            setIsUploading(true)

            // Simulate upload progress for each file
            newUploadingFiles.forEach((uploadingFile) => {
                simulateFileUpload(uploadingFile)
            })
        },
        [onFilesUploaded],
    )

    // Simulate file upload with progress
    const simulateFileUpload = (uploadingFile: UploadingFile) => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 10
            if (progress >= 100) {
                progress = 100
                clearInterval(interval)

                // When upload is complete, convert to FileItem and notify parent
                setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id))

                // If this was the last file, set isUploading to false
                if (uploadingFiles.length === 1) {
                    setIsUploading(false)
                }

                // Create a FileItem from the uploaded file
                const fileItem: FileItem = {
                    id: uploadingFile.id,
                    name: uploadingFile.file.name,
                    size: uploadingFile.file.size,
                    type: uploadingFile.file.type,
                    uploadDate: new Date(),
                    url: URL.createObjectURL(uploadingFile.file),
                }

                onFilesUploaded([fileItem])
            } else {
                // Update progress
                setUploadingFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, progress } : f)))
            }
        }, 200)
    }

    // Cancel upload for a specific file
    const cancelUpload = (id: string) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== id))
        if (uploadingFiles.length === 1) {
            setIsUploading(false)
        }
    }

    // Setup dropzone
    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
            "application/pdf": [],
            "application/msword": [],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
            "application/vnd.ms-excel": [],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "text/plain": [],
        },
    })

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    "hover:border-primary/50 hover:bg-muted/50",
                    isDragActive && "border-primary/70 bg-primary/5",
                    isDragAccept && "border-green-500/70 bg-green-500/5",
                    isDragReject && "border-red-500/70 bg-red-500/5",
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-medium text-lg">
                        {isDragActive
                            ? isDragAccept
                                ? "Drop files to upload"
                                : "Some files will be rejected"
                            : "Drag & drop files here"}
                    </h3>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={(e) => e.stopPropagation()}>
                        Select Files
                    </Button>
                </div>
            </div>

            {/* Uploading files progress */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3 mt-4">
                    <h4 className="font-medium">Uploading {uploadingFiles.length} files...</h4>
                    {uploadingFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3">
                            <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{file.file.name}</p>
                                <Progress value={file.progress} className="h-2 mt-1" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => cancelUpload(file.id)}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Cancel</span>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

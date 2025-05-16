import {useCallback, useRef} from "react"
import {useDropzone} from "react-dropzone"
import type {FileItem} from "../pages/Dashboard.tsx"
import {Upload} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {v4 as uuidv4} from "uuid"

interface FileUploaderProps {
    onFilesUploaded: (files: FileItem[]) => void
}

export function FileUploader({onFilesUploaded}: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = acceptedFiles.map((file) => ({
                id: uuidv4(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date(),
                url: URL.createObjectURL(file),
                progress: 0,
                file: file,
            }))
            onFilesUploaded(newFiles)
        },
        [onFilesUploaded],
    )

    const {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone({
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
        <div className="space-y-4 h-full flex flex-col">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors flex-1 flex items-center justify-center",
                    "hover:border-primary/50 hover:bg-muted/50",
                    isDragActive && "border-primary/70 bg-primary/5",
                    isDragAccept && "border-green-500/70 bg-green-500/5",
                    isDragReject && "border-red-500/70 bg-red-500/5",
                )}
            >
                <input {...getInputProps()} ref={fileInputRef}/>
                <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground"/>
                    <h3 className="font-medium text-lg">
                        {isDragActive
                            ? isDragAccept
                                ? "Drop files to upload"
                                : "Some files will be rejected"
                            : "Drag & drop files here"}
                    </h3>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                        }}
                    >
                        Select Files
                    </Button>
                </div>
            </div>
        </div>
    )
}

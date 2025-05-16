import {useState} from "react"
import type {FileItem} from "../pages/Dashboard.tsx"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    Download,
    Trash2,
    MoreVertical,
    FileIcon,
    FileText,
    FileImage,
    FileArchive,
    Search,
    SortAsc,
    SortDesc,
} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent} from "@/components/ui/card"

interface FileListProps {
    files: FileItem[]
    onDeleteFile: (id: string) => void
    onEditFile?: (id: string, newName: string) => void
}

export function FileList({files, onDeleteFile, onEditFile}: FileListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<keyof FileItem>("uploadDate")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [editingFile, setEditingFile] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"

        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <FileImage className="h-5 w-5"/>
        if (type.startsWith("text/")) return <FileText className="h-5 w-5"/>
        if (type.includes("zip") || type.includes("compressed")) return <FileArchive className="h-5 w-5"/>
        return <FileIcon className="h-5 w-5"/>
    }

    const getFileTypeBadge = (type: string) => {
        let label = type.split("/")[0]
        label = label.charAt(0).toUpperCase() + label.slice(1)

        let variant: "default" | "secondary" | "destructive" | "outline" = "default"

        if (type.startsWith("image/")) variant = "secondary"
        else if (type.startsWith("application/")) variant = "outline"
        else if (type.startsWith("text/")) variant = "default"

        return <Badge variant={variant}>{label}</Badge>
    }

    const handleSort = (field: keyof FileItem) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const filteredAndSortedFiles = [...files]
        .filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortField === "uploadDate") {
                return sortDirection === "asc"
                    ? a.uploadDate.getTime() - b.uploadDate.getTime()
                    : b.uploadDate.getTime() - a.uploadDate.getTime()
            }

            if (sortField === "size") {
                return sortDirection === "asc" ? a.size - b.size : b.size - a.size
            }

            const aValue = String(a[sortField]).toLowerCase()
            const bValue = String(b[sortField]).toLowerCase()

            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        })

    const handleDownload = (file: FileItem) => {
        const link = document.createElement("a");
        link.href = file.url;
        // link.target = "_blank"; // Optional: open in a new tab
        link.download = file.name; // Suggests the original file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditStart = (file: FileItem) => {
        setEditingFile(file.id)
        setEditValue(file.name)
    }

    const handleEditSubmit = (id: string) => {
        if (onEditFile && editValue.trim()) {
            onEditFile(id, editValue.trim())
        }
        setEditingFile(null)
        setEditValue("")
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="search"
                        placeholder="Search files..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredAndSortedFiles.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <FileIcon className="h-10 w-10 text-muted-foreground mb-3"/>
                        <h3 className="text-lg font-medium">No files found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {files.length === 0 ? "Upload some files to get started" : "Try a different search term"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-md border max-h-[50vh] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                                    <div className="flex items-center gap-1">
                                        Name
                                        {sortField === "name" &&
                                            (sortDirection === "asc" ? <SortAsc className="h-4 w-4"/> :
                                                <SortDesc className="h-4 w-4"/>)}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                                    <div className="flex items-center gap-1">
                                        Type
                                        {sortField === "type" &&
                                            (sortDirection === "asc" ? <SortAsc className="h-4 w-4"/> :
                                                <SortDesc className="h-4 w-4"/>)}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("size")}>
                                    <div className="flex items-center gap-1">
                                        Size
                                        {sortField === "size" &&
                                            (sortDirection === "asc" ? <SortAsc className="h-4 w-4"/> :
                                                <SortDesc className="h-4 w-4"/>)}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("uploadDate")}>
                                    <div className="flex items-center gap-1">
                                        Uploaded
                                        {sortField === "uploadDate" &&
                                            (sortDirection === "asc" ? <SortAsc className="h-4 w-4"/> :
                                                <SortDesc className="h-4 w-4"/>)}
                                    </div>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedFiles.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell className="p-2">{getFileIcon(file.type)}</TableCell>
                                    <TableCell className="font-medium">
                                        {editingFile === file.id ? (
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleEditSubmit(file.id)}
                                                onKeyDown={(e) => e.key === "Enter" && handleEditSubmit(file.id)}
                                                autoFocus
                                            />
                                        ) : (
                                            file.name
                                        )}
                                    </TableCell>
                                    <TableCell>{getFileTypeBadge(file.type)}</TableCell>
                                    <TableCell>{formatFileSize(file.size)}</TableCell>
                                    <TableCell>{formatDate(file.uploadDate)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            onClick={() => handleDownload(file)}
                                        >
                                            <Download className="h-4 w-4"/>
                                            <span className="sr-only">Download</span>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                    <MoreVertical className="h-4 w-4"/>
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditStart(file)}
                                                                  className="cursor-pointer">
                                                    <FileText className="mr-2 h-4 w-4"/>
                                                    <span>Rename</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                    onClick={() => onDeleteFile(file.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

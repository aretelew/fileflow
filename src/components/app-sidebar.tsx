import * as React from "react"
import {Home, Search, Settings, Boxes, MoreHorizontal, Plus, Pencil, Trash2} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { NavUser } from "./nav-user"

// Sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    items: [
        {
            title: "Dashboard",
            url: "/",
            icon: Home,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // const [groups, setGroups] = React.useState([
    //     { id: 1, name: "Project Alpha", url: "#" },
    //     { id: 2, name: "Team Bravo", url: "#" },
    //     { id: 3, name: "Research Delta", url: "#" },
    // ])
    //
    // // State for group being edited
    // const [editingGroup, setEditingGroup] = React.useState<{ id: number; name: string } | null>(null)
    //
    // // State for new group name
    // const [newGroupName, setNewGroupName] = React.useState("")
    //
    // // State for dialog open
    // const [dialogOpen, setDialogOpen] = React.useState(false)
    //
    // // State for collapsible open
    // const [isGroupsOpen, setIsGroupsOpen] = React.useState(true)
    //
    // // Add a new state for tracking which group is being edited in-place
    // const [inPlaceEditId, setInPlaceEditId] = React.useState<number | null>(null)
    // const [inPlaceEditValue, setInPlaceEditValue] = React.useState("")
    //
    // // Handle adding a new group
    // const handleAddGroup = () => {
    //     if (newGroupName.trim()) {
    //         const newGroup = {
    //             id: Date.now(),
    //             name: newGroupName,
    //             url: "#",
    //         }
    //         setGroups([...groups, newGroup])
    //         setNewGroupName("")
    //         setDialogOpen(false)
    //     }
    // }
    //
    // // Handle editing a group
    // const handleEditGroup = () => {
    //     if (editingGroup && newGroupName.trim()) {
    //         setGroups(groups.map((group) => (group.id === editingGroup.id ? { ...group, name: newGroupName } : group)))
    //         setNewGroupName("")
    //         setEditingGroup(null)
    //         setDialogOpen(false)
    //     }
    // }
    //
    // // Handle deleting a group
    // const handleDeleteGroup = (id: number) => {
    //     setGroups(groups.filter((group) => group.id !== id))
    // }
    //
    // // Open edit dialog
    // const openEditDialog = (group: { id: number; name: string }) => {
    //     setEditingGroup(group)
    //     setNewGroupName(group.name)
    //     setDialogOpen(true)
    // }
    //
    // // Add a function to handle in-place editing
    // const handleInPlaceEdit = (group: { id: number; name: string }) => {
    //     setInPlaceEditId(group.id)
    //     setInPlaceEditValue(group.name)
    // }
    //
    // // Add a function to save in-place edits
    // const saveInPlaceEdit = () => {
    //     if (inPlaceEditId && inPlaceEditValue.trim()) {
    //         setGroups(groups.map((group) => (group.id === inPlaceEditId ? { ...group, name: inPlaceEditValue } : group)))
    //         setInPlaceEditId(null)
    //     }
    // }
    //
    // // Add a function to handle key press in the in-place edit input
    // const handleInPlaceKeyDown = (e: React.KeyboardEvent) => {
    //     if (e.key === "Enter") {
    //         saveInPlaceEdit()
    //     } else if (e.key === "Escape") {
    //         setInPlaceEditId(null)
    //     }
    // }

    return (
        <Sidebar collapsible="icon" {...props} className="fixed left-0 top-0 h-screen border-r">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <h1 className="text-2xl font-semibold text-left ps-2">FileFlow</h1>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {/* Groups with submenu */}
                            {/*<Collapsible open={isGroupsOpen} onOpenChange={setIsGroupsOpen} className="group/collapsible w-full">*/}
                            {/*    <SidebarMenuItem>*/}
                            {/*        <CollapsibleTrigger asChild>*/}
                            {/*            <SidebarMenuButton>*/}
                            {/*                <Boxes />*/}
                            {/*                <span>Groups</span>*/}
                            {/*                <svg*/}
                            {/*                    xmlns="http://www.w3.org/2000/svg"*/}
                            {/*                    width="24"*/}
                            {/*                    height="24"*/}
                            {/*                    viewBox="0 0 24 24"*/}
                            {/*                    fill="none"*/}
                            {/*                    stroke="currentColor"*/}
                            {/*                    strokeWidth="2"*/}
                            {/*                    strokeLinecap="round"*/}
                            {/*                    strokeLinejoin="round"*/}
                            {/*                    className={`ml-auto h-4 w-4 transition-transform ${isGroupsOpen ? "rotate-180" : ""}`}*/}
                            {/*                >*/}
                            {/*                    <polyline points="6 9 12 15 18 9" />*/}
                            {/*                </svg>*/}
                            {/*            </SidebarMenuButton>*/}
                            {/*        </CollapsibleTrigger>*/}

                            {/*        /!* Add Group Button *!/*/}
                            {/*        <Dialog*/}
                            {/*            open={dialogOpen && !editingGroup}*/}
                            {/*            onOpenChange={(open) => {*/}
                            {/*                setDialogOpen(open)*/}
                            {/*                if (!open) setEditingGroup(null)*/}
                            {/*            }}*/}
                            {/*        >*/}
                            {/*            <DialogTrigger asChild>*/}
                            {/*                <SidebarMenuAction title="Add Group" showOnHover className="cursor-pointer">*/}
                            {/*                    <Plus className="h-4 w-4" />*/}
                            {/*                </SidebarMenuAction>*/}
                            {/*            </DialogTrigger>*/}
                            {/*            <DialogContent>*/}
                            {/*                <DialogHeader>*/}
                            {/*                    <DialogTitle>Create New Group</DialogTitle>*/}
                            {/*                    <DialogDescription>Enter a name for your new group.</DialogDescription>*/}
                            {/*                </DialogHeader>*/}
                            {/*                <div className="grid gap-4 py-4">*/}
                            {/*                    <div className="grid grid-cols-4 items-center gap-4">*/}
                            {/*                        <Label htmlFor="name" className="text-right">*/}
                            {/*                            Name*/}
                            {/*                        </Label>*/}
                            {/*                        <Input*/}
                            {/*                            id="name"*/}
                            {/*                            value={newGroupName}*/}
                            {/*                            onChange={(e) => setNewGroupName(e.target.value)}*/}
                            {/*                            className="col-span-3"*/}
                            {/*                            autoFocus*/}
                            {/*                        />*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*                <DialogFooter>*/}
                            {/*                    <Button type="submit" onClick={handleAddGroup}>*/}
                            {/*                        Create Group*/}
                            {/*                    </Button>*/}
                            {/*                </DialogFooter>*/}
                            {/*            </DialogContent>*/}
                            {/*        </Dialog>*/}
                            {/*        <Dialog*/}
                            {/*            open={dialogOpen && !!editingGroup}*/}
                            {/*            onOpenChange={(open) => {*/}
                            {/*                setDialogOpen(open)*/}
                            {/*                if (!open) setEditingGroup(null)*/}
                            {/*            }}*/}
                            {/*        >*/}
                            {/*            <DialogContent>*/}
                            {/*                <DialogHeader>*/}
                            {/*                    <DialogTitle>Edit Group</DialogTitle>*/}
                            {/*                    <DialogDescription>Update the name of your group.</DialogDescription>*/}
                            {/*                </DialogHeader>*/}
                            {/*                <div className="grid gap-4 py-4">*/}
                            {/*                    <div className="grid grid-cols-4 items-center gap-4">*/}
                            {/*                        <Label htmlFor="edit-name" className="text-right">*/}
                            {/*                            Name*/}
                            {/*                        </Label>*/}
                            {/*                        <Input*/}
                            {/*                            id="edit-name"*/}
                            {/*                            value={newGroupName}*/}
                            {/*                            onChange={(e) => setNewGroupName(e.target.value)}*/}
                            {/*                            className="col-span-3"*/}
                            {/*                            autoFocus*/}
                            {/*                        />*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*                <DialogFooter>*/}
                            {/*                    <Button type="submit" onClick={handleEditGroup}>*/}
                            {/*                        Update Group*/}
                            {/*                    </Button>*/}
                            {/*                </DialogFooter>*/}
                            {/*            </DialogContent>*/}
                            {/*        </Dialog>*/}

                            {/*        <CollapsibleContent>*/}
                            {/*            <SidebarMenuSub>*/}
                            {/*                {groups.map((group) => (*/}
                            {/*                    <SidebarMenuSubItem key={group.id}>*/}
                            {/*                        {inPlaceEditId === group.id ? (*/}
                            {/*                            <div className="flex items-center h-7 px-2 -translate-x-px rounded-md">*/}
                            {/*                                <Input*/}
                            {/*                                    value={inPlaceEditValue}*/}
                            {/*                                    onChange={(e) => setInPlaceEditValue(e.target.value)}*/}
                            {/*                                    onBlur={saveInPlaceEdit}*/}
                            {/*                                    onKeyDown={handleInPlaceKeyDown}*/}
                            {/*                                    className="h-6 py-1 px-1"*/}
                            {/*                                    autoFocus*/}
                            {/*                                />*/}
                            {/*                            </div>*/}
                            {/*                        ) : (*/}
                            {/*                            <SidebarMenuSubButton*/}
                            {/*                                asChild*/}
                            {/*                                onDoubleClick={(e) => {*/}
                            {/*                                    e.preventDefault()*/}
                            {/*                                    handleInPlaceEdit(group)*/}
                            {/*                                }}*/}
                            {/*                            >*/}
                            {/*                                <a href={group.url} className="cursor-pointer">*/}
                            {/*                                    {group.name}*/}
                            {/*                                </a>*/}
                            {/*                            </SidebarMenuSubButton>*/}
                            {/*                        )}*/}

                            {/*                        /!* Three-dot menu for each group *!/*/}
                            {/*                        <DropdownMenu>*/}
                            {/*                            <DropdownMenuTrigger asChild>*/}
                            {/*                                <button className="absolute right-1 top-1.5 flex h-5 w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-0 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/menu-item:opacity-100 cursor-pointer">*/}
                            {/*                                    <MoreHorizontal className="h-4 w-4" />*/}
                            {/*                                    <span className="sr-only">More options</span>*/}
                            {/*                                </button>*/}
                            {/*                            </DropdownMenuTrigger>*/}
                            {/*                            <DropdownMenuContent align="end">*/}
                            {/*                                <DropdownMenuItem onClick={() => openEditDialog(group)}>*/}
                            {/*                                    <Pencil className="mr-2 h-4 w-4" />*/}
                            {/*                                    <span>Edit</span>*/}
                            {/*                                </DropdownMenuItem>*/}
                            {/*                                <DropdownMenuItem*/}
                            {/*                                    className="text-destructive focus:text-destructive"*/}
                            {/*                                    onClick={() => handleDeleteGroup(group.id)}*/}
                            {/*                                >*/}
                            {/*                                    <Trash2 className="mr-2 h-4 w-4" />*/}
                            {/*                                    <span>Delete</span>*/}
                            {/*                                </DropdownMenuItem>*/}
                            {/*                            </DropdownMenuContent>*/}
                            {/*                        </DropdownMenu>*/}
                            {/*                    </SidebarMenuSubItem>*/}
                            {/*                ))}*/}
                            {/*            </SidebarMenuSub>*/}
                            {/*        </CollapsibleContent>*/}
                            {/*    </SidebarMenuItem>*/}
                            {/*</Collapsible>*/}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href={"#"}>
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}

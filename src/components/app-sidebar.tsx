import * as React from "react"
import {Home, Settings} from "lucide-react"
import {useAuth} from "@/contexts/AuthContext"

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
} from "@/components/ui/sidebar"
import {NavUser} from "./nav-user"

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {user} = useAuth();
    const userData = {
        name: user?.displayName || 'Guest',
        email: user?.email || '',
        avatar: user?.photoURL || '/avatars/default.jpg',
    };
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
                            <SidebarMenuItem key={"Dashboard"}>
                                <SidebarMenuButton asChild>
                                    <a href={"/dashboard"}>
                                        <Home/>
                                        <span>{"Dashboard"}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href={"#"}>
                                <Settings/>
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser user={userData}/>
            </SidebarFooter>
        </Sidebar>
    )
}

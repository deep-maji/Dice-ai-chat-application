"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, FolderIcon, ArrowRightIcon, Trash2Icon } from "lucide-react"
import type { ChatsHistroy } from "@/types/types"
import { useState } from "react"

export function NavThreads({
  chatHistroy,
  handleThreadNavigate,
  handleThreadDelete
}: {
  chatHistroy: ChatsHistroy[]
  handleThreadNavigate: (id: string) => void;
  handleThreadDelete: (mongoThreadId: string) => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [selectedThreadForDelete, setSelectedThreadForDelete] = useState<string | null>(null)
  const [selectedThreadTitle, setSelectedThreadTitle] = useState<string | null>(null)

  const handleNavigate = (threadId: string) => {
    handleThreadNavigate(threadId)

    // Close sidebar on mobile after clicking
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleDeleteClick = (threadId: string) => {
    setSelectedThreadForDelete(threadId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedThreadForDelete) return

    handleThreadDelete(selectedThreadForDelete)

    setDeleteDialogOpen(false)
    setSelectedThreadForDelete(null)
  }


  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Threads</SidebarGroupLabel>
        <SidebarMenu>
          {chatHistroy.map((item) => (
            <SidebarMenuItem key={item._id}>
              <SidebarMenuButton onClick={(e) => { e.preventDefault(); handleNavigate(item.threadId); }}>
                <span>{item.title}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="aria-expanded:bg-muted"
                    />
                  }
                >
                  <MoreHorizontalIcon
                  />
                  <span className="sr-only">More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-fit"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleNavigate(item.threadId); }}>
                    <FolderIcon
                    />
                    <span>View Thread</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <ArrowRightIcon
                    />
                    <span>Share Thread</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => { handleDeleteClick(item._id); setSelectedThreadTitle(item.title); }}
                  >
                    <Trash2Icon
                    />
                    <span>Delete Thread</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}

          {/* <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontalIcon className="text-sidebar-foreground/70" />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}

        </SidebarMenu>
      </SidebarGroup>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Thread?</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete "{selectedThreadTitle}" thread? <br />
              <p className="font-bold">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={confirmDelete}
          >
            <Trash2Icon />
            Delete
          </Button>
        </DialogContent>
      </Dialog>

    </>
  )
}

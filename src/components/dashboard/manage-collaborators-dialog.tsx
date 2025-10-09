
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  addCollaborator,
  updateCollaboratorPermissions,
  removeCollaborator,
} from "@/lib/db-books";
import { useAuth } from "@/hooks/use-auth";
import type { Collaborator } from "@/lib/types";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageCollaboratorsDialogProps {
  book: { id: string; name: string; collaborators: Collaborator[] };
  isOpen: boolean;
  onClose: () => void;
}

export type CollaboratorRole = "Full Access" | "Add Transactions Only";

export default function ManageCollaboratorsDialog({
  book: initialBook,
  isOpen,
  onClose,
}: ManageCollaboratorsDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("Add Transactions Only");
  const [isInviting, setIsInviting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  // Internal state to manage collaborators without causing a full page refresh
  const [book, setBook] = useState(initialBook);

  useEffect(() => {
    setBook(initialBook);
  }, [initialBook]);

  const handleInvite = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    setIsInviting(true);
    try {
      const newCollaborator = await addCollaborator(book.id, email, role);

      await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          bookId: book.id,
          bookName: book.name,
          ownerName: user?.displayName || user?.email || "Someone",
        }),
      });

      toast({
        title: "Invitation Sent",
        description: `${email} has been invited to ${book.name}.`,
      });
      setEmail("");
      // Update internal state
      setBook((prevBook) => ({
        ...prevBook,
        collaborators: [...prevBook.collaborators, newCollaborator],
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitation.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handlePermissionChange = async (
    collaboratorEmail: string,
    permission: "balance" | "income" | "expenses",
    value: boolean
  ) => {
    try {
      await updateCollaboratorPermissions(
        book.id,
        collaboratorEmail,
        permission,
        value
      );

      // Optimistically update the internal state
      setBook((prevBook) => ({
        ...prevBook,
        collaborators: prevBook.collaborators.map((c) =>
          c.email.toLowerCase() === collaboratorEmail.toLowerCase()
            ? { ...c, visibility: { ...c.visibility, [permission]: value } }
            : c
        ),
      }));

      toast({
        title: "Permissions Updated",
        description: `Visibility settings for ${collaboratorEmail} have been updated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permissions.",
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail: string) => {
    try {
      await removeCollaborator(book.id, collaboratorEmail);

      // Update internal state
      setBook((prevBook) => ({
        ...prevBook,
        collaborators: prevBook.collaborators.filter(
          (c) => c.email.toLowerCase() !== collaboratorEmail.toLowerCase()
        ),
      }));

      toast({
        title: "Collaborator Removed",
        description: `${collaboratorEmail} has been removed from the cash book.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove collaborator.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>Manage Collaborators</DialogTitle>
          <DialogDescription>
            Invite new members and manage permissions for {`"${book.name}"`}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="collaborator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value: CollaboratorRole) => setRole(value)}
                defaultValue={role}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Add Transactions Only">
                    Add Transactions Only
                  </SelectItem>
                  <SelectItem value="Full Access">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvite}
              className="w-full"
              isLoading={isInviting}
            >
              Send Invitation
            </Button>

            {book.collaborators && book.collaborators.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Existing Collaborators
                  </h3>
                  <div className="space-y-4">
                    {book.collaborators.map((c, index) => (
                      <div
                        key={`${c.email}-${index}`}
                        className="p-3 border rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold break-all">{c.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {c.role} ({c.status})
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                            onClick={() => handleRemoveCollaborator(c.email)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {c.role === "Add Transactions Only" && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">
                              Visibility Settings
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`balance-${c.email}`}
                                  className="text-sm font-normal"
                                >
                                  View Total Balance
                                </Label>
                                <Switch
                                  id={`balance-${c.email}`}
                                  checked={c.visibility?.balance}
                                  onCheckedChange={(val) =>
                                    handlePermissionChange(
                                      c.email,
                                      "balance",
                                      val
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`income-${c.email}`}
                                  className="text-sm font-normal"
                                >
                                  View Total Income
                                </Label>
                                <Switch
                                  id={`income-${c.email}`}
                                  checked={c.visibility?.income}
                                  onCheckedChange={(val) =>
                                    handlePermissionChange(
                                      c.email,
                                      "income",
                                      val
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`expenses-${c.email}`}
                                  className="text-sm font-normal"
                                >
                                  View Total Expenses
                                </Label>
                                <Switch
                                  id={`expenses-${c.email}`}
                                  checked={c.visibility?.expenses}
                                  onCheckedChange={(val) =>
                                    handlePermissionChange(
                                      c.email,
                                      "expenses",
                                      val
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addCollaborator } from "@/lib/db-books";
import { useAuth } from "@/hooks/use-auth";

interface ManageCollaboratorsDialogProps {
  book: { id: string; name: string };
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageCollaboratorsDialog({ book, isOpen, onClose }: ManageCollaboratorsDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Viewer" | "Editor">("Viewer");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    try {
      // 1. Add collaborator to Firestore with 'pending' status
      await addCollaborator(book.id, email, role);

      // 2. Call the API route to send the invitation email
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
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Collaborators for {book.name}</DialogTitle>
          <DialogDescription>
            Invite others to view or edit this cash book.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
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
            <Select onValueChange={(value: "Viewer" | "Editor") => setRole(value)} defaultValue={role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleInvite}>Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

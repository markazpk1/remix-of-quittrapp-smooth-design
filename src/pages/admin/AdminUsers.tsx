import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, MoreHorizontal, Shield, Ban, Mail, Trash2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  joined: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", plan: "Starter" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.error) {
        console.error('API error:', data.error);
        toast({ title: "Error", description: data.error });
        setUsers([]);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: "Error", description: "Failed to load users" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async () => {
    if (!roleDialogUser || !newRole) return;
    try {
      const response = await api.updateUserRole(roleDialogUser.id, newRole);
      if (response.error) {
        toast({ title: "Error", description: response.error });
        return;
      }
      await fetchUsers();
      toast({ title: "Role Updated", description: `${roleDialogUser.name} is now a ${newRole}.` });
      setRoleDialogOpen(false);
      setRoleDialogUser(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role" });
    }
  };

  const toggleBan = async (user: User) => {
    try {
      const response = await api.toggleBanUser(user.id);
      if (response.error) {
        toast({ title: "Error", description: response.error });
        return;
      }
      await fetchUsers();
      toast({ 
        title: "Status Updated", 
        description: `${user.name} has been ${user.status === 'banned' ? 'unbanned' : 'banned'} successfully.` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status" });
    }
  };

  const deleteUser = (user: User) => {
    setConfirm({
      open: true,
      title: `Delete ${user.name}?`,
      description: "This will permanently remove the user and all their data. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await api.deleteUser(user.id);
          if (response.error) {
            toast({ title: "Error", description: response.error });
            return;
          }
          await fetchUsers();
          toast({ title: "User Deleted", description: `${user.name} has been removed.` });
        } catch (error) {
          toast({ title: "Error", description: "Failed to delete user" });
        }
      },
    });
  };

  const sendEmail = async (user: User) => {
    try {
      const subject = "Important Notification from Momin Core";
      const message = `Dear ${user.name},\n\nThis is an important notification from the Momin Core administration team.\n\nPlease contact us if you have any questions.\n\nBest regards,\nMomin Core Team`;
      
      const response = await api.sendUserEmail(user.id, subject, message);
      if (response.error) {
        toast({ title: "Error", description: response.error });
        return;
      }
      toast({ title: "Email Sent", description: `Notification email sent to ${user.email}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send email" });
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.plan) {
      toast({ title: "Error", description: "All fields are required" });
      return;
    }

    try {
      const response = await api.addUser(newUser);
      
      if (response.error) {
        toast({ title: "Error", description: response.error });
        return;
      }

      // Show success message with temporary password
      toast({ 
        title: "User Created Successfully", 
        description: `User created with temporary password: ${response.tempPassword}` 
      });

      // Reset form and close dialog
      setNewUser({ name: "", email: "", role: "user", plan: "Starter" });
      setAddDialogOpen(false);
      
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Add user error:', error);
      toast({ title: "Error", description: "Failed to create user" });
    }
  };

  const roleBadge = (role: string) => {
    const variants: Record<string, string> = {
      admin: "bg-primary/20 text-primary border-primary/30",
      moderator: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      user: "bg-secondary text-muted-foreground border-border/30",
    };
    return variants[role] || variants.user;
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      banned: "bg-red-500/20 text-red-400 border-red-500/30",
      inactive: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return variants[status] || variants.inactive;
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Yes, continue" />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts, roles, and permissions.</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><UserPlus className="w-4 h-4 mr-2" /> Add User</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader><DialogTitle className="text-foreground">Add New User</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@email.com" className="bg-secondary/40 border-border/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border/40"><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Plan</Label>
                  <Select value={newUser.plan} onValueChange={(v) => setNewUser({ ...newUser, plan: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border/40"><SelectItem value="Starter">Starter</SelectItem><SelectItem value="Pro">Pro</SelectItem><SelectItem value="Enterprise">Enterprise</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addUser} className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-card border-border/40">
          <DialogHeader><DialogTitle className="text-foreground">Change Role for {roleDialogUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent className="bg-card border-border/40"><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={changeRole}>Save</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-sm font-medium text-foreground">All Users ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Plan</TableHead>
                  <TableHead className="text-muted-foreground">Joined</TableHead>
                  <TableHead className="text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id} className="border-border/20 hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{u.name.split(" ").map((n) => n[0]).join("")}</div>
                          <div><div className="text-sm font-medium text-foreground">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${roleBadge(u.role)}`}>{u.role}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${statusBadge(u.status)}`}>{u.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.plan}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border/40">
                            <DropdownMenuItem className="text-xs" onClick={() => { setRoleDialogUser(u); setNewRole(u.role); setRoleDialogOpen(true); }}><Shield className="w-3 h-3 mr-2" /> Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onClick={() => sendEmail(u)}><Mail className="w-3 h-3 mr-2" /> Send Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onClick={() => toggleBan(u)}><Ban className="w-3 h-3 mr-2" /> {u.status === "banned" ? "Unban" : "Ban"} User</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-red-400" onClick={() => deleteUser(u)}><Trash2 className="w-3 h-3 mr-2" /> Delete User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

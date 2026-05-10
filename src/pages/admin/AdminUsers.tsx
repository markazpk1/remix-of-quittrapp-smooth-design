import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Search, MoreHorizontal, Shield, Ban, Mail, Trash2, UserPlus, Sparkles, Plus, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "../../hooks/use-toast";
import { api } from "../../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  joined: string;
}

// API response interface
interface ApiUser {
  id: string;
  email?: string;
  full_name: string;
  role?: string;
  created_at: string;
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
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailUser, setEmailUser] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Array<{id: string; name: string; system: boolean}>>([]);
  
  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);


  const fetchAvailableRoles = async () => {
    try {
      const response = await api.getAllRoles();
      if (response.success && Array.isArray(response.data)) {
        setAvailableRoles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      if (response.success && Array.isArray(response.data)) {
        // Transform API data to match User interface
        const transformedUsers: User[] = response.data.map((apiUser: any) => ({
          id: apiUser.id,
          name: apiUser.name || apiUser.full_name || 'Unknown User',
          email: apiUser.email || 'No email',
          role: apiUser.role || 'user',
          status: apiUser.status || 'active', // Use actual status from database
          plan: apiUser.plan || 'Starter',
          joined: new Date(apiUser.created_at).toLocaleDateString()
        }));
        setUsers(transformedUsers);
      } else {
        console.error('API error:', response.message);
        toast({ title: "Error", description: response.message || "Error loading users" });
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
    if (!roleDialogUser || !newRole) {
      console.log('Missing data:', { roleDialogUser, newRole });
      return;
    }
    
    console.log('Updating role:', {
      userId: roleDialogUser.id,
      userName: roleDialogUser.name,
      currentRole: roleDialogUser.role,
      newRole: newRole
    });
    
    try {
      const response = await api.updateUserRole(roleDialogUser.id, newRole);
      console.log('API response:', response);
      
      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Error updating role",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Role update successful, refreshing users...');
      await fetchUsers();
      toast({ 
        title: "Role Updated", 
        description: `${roleDialogUser.name} is now a ${newRole}.` 
      });
      setRoleDialogOpen(false);
      setRoleDialogUser(null);
    } catch (error) {
      console.error('Change role error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const toggleBan = async (user: User) => {
    try {
      const response = await api.toggleBanUser(user.id);
      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Error updating user status",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the ban functionality is simulated or real
      if (response.message.includes('simulated')) {
        toast({ 
          title: "Status Updated", 
          description: `${user.name}'s ban status toggled (simulated - run SQL to add status column for persistence)` 
        });
      } else {
        // Real ban functionality - refresh the user list
        await fetchUsers();
        toast({ 
          title: "Status Updated", 
          description: response.message 
        });
      }
    } catch (error) {
      console.error('Toggle ban error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update user status",
        variant: "destructive"
      });
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
          if (!response.success) {
            toast({ 
              title: "Error", 
              description: response.message || "Error deleting user",
              variant: "destructive"
            });
            return;
          }
          await fetchUsers();
          toast({ 
            title: "User Deleted", 
            description: `${user.name} has been removed successfully.` 
          });
        } catch (error) {
          console.error('Delete user error:', error);
          toast({ 
            title: "Error", 
            description: "Failed to delete user",
            variant: "destructive"
          });
        }
      },
    });
  };

  const sendEmail = (user: User) => {
    setEmailUser(user);
    setEmailSubject("");
    setEmailMessage(`Dear ${user.name},\n\n`);
    setEmailDialogOpen(true);
  };

  const sendCustomEmail = async () => {
    if (!emailUser || !emailSubject.trim() || !emailMessage.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Subject and message are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingEmail(true);
      
      const response = await api.sendUserEmail(emailUser.id, emailSubject, emailMessage);
      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Error sending email",
          variant: "destructive"
        });
        return;
      }
      
      toast({ 
        title: response.message.includes('SMTP not configured') ? "Email Logged" : "Email Sent", 
        description: response.message
      });
      
      // Reset form and close dialog
      setEmailDialogOpen(false);
      setEmailUser(null);
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      console.error('Send email error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const addUser = async () => {
    // Enhanced form validation
    const errors: string[] = [];
    
    if (!newUser.name.trim()) {
      errors.push("Name is required");
    } else if (newUser.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    
    if (!newUser.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!newUser.role) {
      errors.push("Role is required");
    }
    
    if (!newUser.plan) {
      errors.push("Plan is required");
    }

    if (errors.length > 0) {
      toast({ 
        title: "Validation Error", 
        description: errors.join(", ")
      });
      return;
    }

    try {
      setIsCreatingUser(true);
      
      const response = await api.addUser({
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        plan: newUser.plan
      });
      
      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Error creating user",
          variant: "destructive"
        });
        return;
      }

      // Show success message with temporary password
      const tempPassword = response.data?.tempPassword || 'N/A';
      toast({ 
        title: "User Created Successfully", 
        description: `${newUser.name} has been created. Temporary password: ${tempPassword}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(tempPassword);
              toast({ title: "Copied", description: "Password copied to clipboard" });
            }}
          >
            Copy Password
          </Button>
        )
      });

      // Reset form and close dialog
      setNewUser({ name: "", email: "", role: "user", plan: "Starter" });
      setAddDialogOpen(false);
      
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Add user error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
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
      <ConfirmDialog 
        open={confirm.open} 
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} 
        title={confirm.title} 
        description={confirm.description} 
        onConfirm={confirm.onConfirm} 
        confirmLabel="Yes, continue" 
      />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Community & Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and system roles.</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4 mr-2" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New User</DialogTitle>
              <DialogDescription className="text-muted-foreground">Create a new user account with specific role and plan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} 
                  placeholder="Full name" 
                  className="bg-secondary/40 border-border/30" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                  placeholder="email@example.com" 
                  className="bg-secondary/40 border-border/30" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40">
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name.toLowerCase()}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={newUser.plan} onValueChange={(v) => setNewUser({ ...newUser, plan: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40">
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={addUser} disabled={isCreatingUser}>
                  {isCreatingUser ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users by name or email..." 
                className="pl-10 bg-secondary/40 border-border/30 h-10" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground pl-6">User</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="text-muted-foreground w-12 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="py-4 pl-6 pr-6"><Skeleton className="h-10 w-full bg-secondary/40" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="border-border/20 hover:bg-secondary/20 group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${roleBadge(user.role.toLowerCase())}`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${statusBadge(user.status.toLowerCase())}`}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{user.plan}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{user.joined}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border/40 backdrop-blur-md shadow-xl">
                          <DropdownMenuItem onClick={() => { setRoleDialogUser(user); setNewRole(user.role.toLowerCase()); setRoleDialogOpen(true); }}>
                            <Shield className="w-4 h-4 mr-2 text-primary" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sendEmail(user)}>
                            <Mail className="w-4 h-4 mr-2 text-blue-400" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleBan(user)} className={user.status === 'banned' ? 'text-green-400' : 'text-amber-400'}>
                            <Ban className="w-4 h-4 mr-2" /> {user.status === 'banned' ? 'Unban' : 'Ban'} User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteUser(user)} className="text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Role for {roleDialogUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-secondary/40 border-border/30">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40">
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name.toLowerCase()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={changeRole}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEmailDialogOpen(false);
          setEmailUser(null);
          setEmailSubject("");
          setEmailMessage("");
        }
      }}>
        <DialogContent className="bg-card border-border/40 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Send Email to {emailUser?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Compose and send an email to {emailUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
                placeholder="Enter email subject" 
                className="bg-secondary/40 border-border/30" 
                disabled={isSendingEmail} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                value={emailMessage} 
                onChange={(e) => setEmailMessage(e.target.value)} 
                placeholder="Type your message here..." 
                className="bg-secondary/40 border-border/30 min-h-[150px] resize-none" 
                disabled={isSendingEmail} 
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <DialogClose asChild><Button variant="outline" disabled={isSendingEmail}>Cancel</Button></DialogClose>
              <Button onClick={sendCustomEmail} disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}>
                {isSendingEmail ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Shield, Plus, Users, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { supabase } from "@/services/supabase";

interface Role {
  id: string; 
  name: string; 
  color: string; 
  users: number; 
  system: boolean;
  permissions: Record<string, boolean>;
}

const permissionLabels: Record<string, string> = {
  dashboard: "View Dashboard", 
  users: "Manage Users", 
  content: "Manage Content", 
  services: "Manage Services",
  billing: "Billing & Subscriptions", 
  settings: "Platform Settings", 
  audit: "View Audit Logs", 
  support: "Handle Support",
  roles: "Manage Roles", 
  reports: "View Reports", 
  media: "Media Library", 
  api: "API Access",
};

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newPerms, setNewPerms] = useState<Record<string, boolean>>(Object.fromEntries(Object.keys(permissionLabels).map((k) => [k, false])));
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchRoleData();
  }, []);

  const fetchRoleData = async () => {
    try {
      setLoading(true);
      const response = await api.getRoleStats();
      
      if (!response.success) {
        toast({ title: "Error", description: response.message || "Failed to load role data" });
        return;
      }

      // Get roles with their permissions
      const { data: rolesWithPerms } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          color,
          system,
          created_at,
          permissions (
            permission_key,
            enabled
          )
        `)
        .order('created_at', { ascending: true });

      if (!rolesWithPerms) {
        toast({ title: "Error", description: "No roles found" });
        return;
      }

      // Transform roles data to match interface
      const transformedRoles: Role[] = rolesWithPerms.map((role: any) => {
        const permissions: Record<string, boolean> = {};
        
        // Add all permission keys with default false
        Object.keys(permissionLabels).forEach(key => {
          permissions[key] = false;
        });
        
        // Set actual permissions from database
        role.permissions.forEach((perm: any) => {
          permissions[perm.permission_key] = perm.enabled;
        });

        return {
          id: role.id,
          name: role.name,
          color: role.color,
          users: response.data?.roles?.find((r: any) => r.id === role.id)?.userCount || 0,
          system: role.system,
          permissions
        };
      });

      setRoles(transformedRoles);
      setSelectedRole(transformedRoles[0]); // Select first role by default
    } catch (error) {
      console.error('Failed to fetch role data:', error);
      toast({ title: "Error", description: "Failed to load role data" });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (roleId: string, key: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.system) {
      toast({ title: "Error", description: "System role permissions cannot be modified", variant: "destructive" });
      return;
    }

    try {
      const response = await api.updateRolePermission(roleId, key, !role.permissions[key]);
      
      if (!response.success) {
        toast({ title: "Error", description: response.message || "Failed to update permission", variant: "destructive" });
        return;
      }

      // Update local state
      setRoles((prev) => prev.map((r) => {
        if (r.id !== roleId) return r;
        const updated = { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } };
        if (selectedRole?.id === roleId) setSelectedRole(updated);
        return updated;
      }));

      toast({ title: "Success", description: "Permission updated successfully" });
    } catch (error) {
      console.error('Toggle permission error:', error);
      toast({ title: "Error", description: "Failed to update permission", variant: "destructive" });
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      toast({ title: "Error", description: "Role name is required", variant: "destructive" });
      return;
    }

    try {
      const response = await api.createRole({
        name: newRoleName.trim(),
        color: "bg-secondary text-muted-foreground border-border/30",
        permissions: newPerms
      });

      if (!response.success) {
        toast({ title: "Error", description: response.message || "Failed to create role", variant: "destructive" });
        return;
      }

      toast({ title: "Success", description: "Role created successfully" });
      
      // Reset form and close dialog
      setAddOpen(false);
      setNewRoleName("");
      setNewPerms(Object.fromEntries(Object.keys(permissionLabels).map((k) => [k, false])));
      
      // Refresh roles data
      await fetchRoleData();
    } catch (error) {
      console.error('Create role error:', error);
      toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
    }
  };

  const deleteRole = (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (role?.system) {
      toast({ title: "Cannot Delete", description: "System roles cannot be deleted", variant: "destructive" });
      return;
    }

    setConfirm({
      open: true,
      title: `Delete "${role?.name}"?`,
      description: "This will permanently remove the role and all its permissions. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await api.deleteRole(id);
          
          if (!response.success) {
            toast({ title: "Error", description: response.message || "Failed to delete role", variant: "destructive" });
            return;
          }

          toast({ title: "Success", description: "Role deleted successfully" });
          
          // Refresh roles data
          await fetchRoleData();
        } catch (error) {
          console.error('Delete role error:', error);
          toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete Role" />

      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-foreground">Roles & Permissions</h1><p className="text-sm text-muted-foreground">Define access levels and manage role-based permissions.</p></div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="bg-primary text-primary-foreground text-sm"><Plus className="w-3.5 h-3.5 mr-2" /> Create Role</Button></DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader><DialogTitle className="text-foreground">Create New Role</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><label className="text-sm text-foreground">Role Name</label><Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Marketing Manager" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-3">
                <label className="text-sm text-foreground">Permissions</label>
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Switch checked={newPerms[key]} onCheckedChange={() => setNewPerms((p) => ({ ...p, [key]: !p[key] }))} /></div>
                ))}
              </div>
              <Button onClick={createRole} className="w-full">Create Role</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            roles.map((role) => (
              <Card key={role.id} className={`bg-card/60 border-border/40 cursor-pointer transition-colors ${selectedRole?.id === role.id ? "ring-1 ring-primary/50" : "hover:border-border/60"}`} onClick={() => setSelectedRole(role)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.color.split(" ")[0]}`}><Shield className={`w-4 h-4 ${role.color.split(" ")[1]}`} /></div>
                      <div>
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">{role.name}{role.system && <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">System</Badge>}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {role.users} users</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                {selectedRole && <Badge variant="outline" className={`capitalize ${selectedRole.color}`}>{selectedRole.name}</Badge>}
                Permissions
              </CardTitle>
              {selectedRole && !selectedRole.system && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => selectedRole && deleteRole(selectedRole.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Permission</TableHead>
                    <TableHead className="text-muted-foreground text-right">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(selectedRole.permissions).map(([key, value]) => (
                    <TableRow key={key} className="border-border/20 hover:bg-secondary/20">
                      <TableCell className="text-sm text-foreground">{permissionLabels[key]}</TableCell>
                      <TableCell className="text-right">
                        <Switch 
                          checked={value} 
                          disabled={selectedRole.system} 
                          onCheckedChange={() => togglePermission(selectedRole.id, key)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-sm text-muted-foreground">Select a role to view permissions</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
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

interface Role {
  id: number; name: string; color: string; users: number; system: boolean;
  permissions: Record<string, boolean>;
}

const permissionLabels: Record<string, string> = {
  dashboard: "View Dashboard", users: "Manage Users", content: "Manage Content", services: "Manage Services",
  billing: "Billing & Subscriptions", settings: "Platform Settings", audit: "View Audit Logs", support: "Handle Support",
  roles: "Manage Roles", reports: "View Reports", media: "Media Library", api: "API Access",
};

const initialRoles: Role[] = [
  { id: 1, name: "Super Admin", color: "bg-red-500/20 text-red-400 border-red-500/30", users: 2, system: true, permissions: { dashboard: true, users: true, content: true, services: true, billing: true, settings: true, audit: true, support: true, roles: true, reports: true, media: true, api: true } },
  { id: 2, name: "Admin", color: "bg-primary/20 text-primary border-primary/30", users: 3, system: true, permissions: { dashboard: true, users: true, content: true, services: true, billing: true, settings: true, audit: true, support: true, roles: false, reports: true, media: true, api: false } },
  { id: 3, name: "Moderator", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", users: 5, system: false, permissions: { dashboard: true, users: false, content: true, services: false, billing: false, settings: false, audit: false, support: true, roles: false, reports: false, media: true, api: false } },
  { id: 4, name: "Support Agent", color: "bg-green-500/20 text-green-400 border-green-500/30", users: 8, system: false, permissions: { dashboard: true, users: false, content: false, services: false, billing: false, settings: false, audit: false, support: true, roles: false, reports: false, media: false, api: false } },
  { id: 5, name: "Content Manager", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", users: 4, system: false, permissions: { dashboard: true, users: false, content: true, services: false, billing: false, settings: false, audit: false, support: false, roles: false, reports: false, media: true, api: false } },
];

export default function AdminRoles() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [addOpen, setAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newPerms, setNewPerms] = useState<Record<string, boolean>>(Object.fromEntries(Object.keys(permissionLabels).map((k) => [k, false])));
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const togglePermission = (roleId: number, key: string) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id !== roleId || r.system) return r;
      const updated = { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } };
      if (selectedRole.id === roleId) setSelectedRole(updated);
      return updated;
    }));
    toast({ title: "Permission Updated" });
  };

  const createRole = () => {
    if (!newRoleName) return;
    const id = Math.max(...roles.map((r) => r.id)) + 1;
    const role: Role = { id, name: newRoleName, color: "bg-primary/20 text-primary border-primary/30", users: 0, system: false, permissions: { ...newPerms } };
    setRoles((prev) => [...prev, role]);
    toast({ title: "Role Created", description: `${newRoleName} has been added.` });
    setAddOpen(false);
    setNewRoleName("");
    setNewPerms(Object.fromEntries(Object.keys(permissionLabels).map((k) => [k, false])));
  };

  const deleteRole = (id: number) => {
    const role = roles.find((r) => r.id === id);
    if (role?.system) return;
    setConfirm({
      open: true, title: `Delete "${role?.name}" role?`, description: `This will remove the role and its ${role?.users} assigned users will need to be reassigned.`,
      onConfirm: () => {
        setRoles((prev) => prev.filter((r) => r.id !== id));
        if (selectedRole.id === id) setSelectedRole(roles[0]);
        toast({ title: "Role Deleted", description: `${role?.name} has been removed.` });
      },
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
          {roles.map((role) => (
            <Card key={role.id} className={`bg-card/60 border-border/40 cursor-pointer transition-colors ${selectedRole.id === role.id ? "ring-1 ring-primary/50" : "hover:border-border/60"}`} onClick={() => setSelectedRole(role)}>
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
          ))}
        </div>

        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2"><Badge variant="outline" className={`capitalize ${selectedRole.color}`}>{selectedRole.name}</Badge>Permissions</CardTitle>
              {!selectedRole.system && (
                <div className="flex gap-2"><Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteRole(selectedRole.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground">Permission</TableHead><TableHead className="text-muted-foreground text-right">Access</TableHead></TableRow></TableHeader>
              <TableBody>
                {Object.entries(selectedRole.permissions).map(([key, value]) => (
                  <TableRow key={key} className="border-border/20 hover:bg-secondary/20">
                    <TableCell className="text-sm text-foreground">{permissionLabels[key]}</TableCell>
                    <TableCell className="text-right"><Switch checked={value} disabled={selectedRole.system} onCheckedChange={() => togglePermission(selectedRole.id, key)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

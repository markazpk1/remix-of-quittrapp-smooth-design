import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Trophy, Calendar, Flame } from "lucide-react";

export default function UserProfile() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                JD
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">John Doe</h2>
              <p className="text-sm text-muted-foreground">john.doe@email.com</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">Pro Member</Badge>
                <Badge variant="outline" className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Flame className="w-3 h-3 mr-1" /> 14 Day Streak
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">14</div>
              <div className="text-[10px] text-muted-foreground">Days Clean</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">5</div>
              <div className="text-[10px] text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">14</div>
              <div className="text-[10px] text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">First Name</Label>
              <Input defaultValue="John" className="bg-secondary/40 border-border/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Last Name</Label>
              <Input defaultValue="Doe" className="bg-secondary/40 border-border/30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Email</Label>
            <Input defaultValue="john.doe@email.com" className="bg-secondary/40 border-border/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Bio</Label>
            <Textarea defaultValue="On a journey to become the best version of myself." className="bg-secondary/40 border-border/30 resize-none" rows={3} />
          </div>
          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground text-sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

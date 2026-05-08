import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Trophy, Calendar, Flame } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const response = await api.getUserProfile();
      if (response.error) {
        toast.error('Failed to load profile data');
        return;
      }
      
      const data = response.data || {};
      setProfileData({
        profile: data.profile || {
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email,
          city: user.user_metadata?.city || "Not specified",
          madhab: user.user_metadata?.madhab || "Not specified",
          joinDate: "May 2024",
          avatar: user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || "JD"
        },
        stats: data.stats || {
          daysClean: 14,
          achievements: 5,
          bestStreak: 14
        }
      });
    } catch (error) {
      console.error('Profile data error:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      full_name: formData.get("full_name") as string,
      city: formData.get("city") as string,
      madhab: formData.get("madhab") as string,
    };

    try {
      const response = await api.updateUserProfile(updates);
      if (response.success) {
        toast.success("Profile updated successfully ✨");
        fetchProfileData();
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const profile = profileData?.profile || {};
  const stats = profileData?.stats || {};

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
                {profile.avatar}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">{profile.plan} Member</Badge>
                <Badge variant="outline" className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Flame className="w-3 h-3 mr-1" /> {stats.daysClean} Day Streak
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.daysClean}</div>
              <div className="text-[10px] text-muted-foreground">Days Clean</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.achievements}</div>
              <div className="text-[10px] text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.bestStreak}</div>
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
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Full Name</Label>
                <Input name="full_name" defaultValue={profile.full_name} className="bg-secondary/40 border-border/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground">City</Label>
                <Input name="city" defaultValue={profile.city} className="bg-secondary/40 border-border/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Email</Label>
              <Input defaultValue={profile.email} className="bg-secondary/40 border-border/30" disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Madhab</Label>
              <Input name="madhab" defaultValue={profile.madhab} className="bg-secondary/40 border-border/30" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground text-sm">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Download,
  Moon,
  Sun,
  Monitor,
  Save,
} from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSettings {
  // Profile
  name: string;
  email: string;
  role: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertThreshold: string;
  notificationFrequency: string;
  
  // Appearance
  theme: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  
  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  
  // Data & Privacy
  dataRetention: number;
  shareAnalytics: boolean;
  autoBackup: boolean;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<UserSettings>({
    name: "Admin User",
    email: "admin@finsight.com",
    role: "Administrator",
    emailNotifications: true,
    pushNotifications: true,
    alertThreshold: "medium",
    notificationFrequency: "realtime",
    theme: "system",
    compactMode: false,
    animationsEnabled: true,
    twoFactorEnabled: false,
    sessionTimeout: 30,
    dataRetention: 90,
    shareAnalytics: true,
    autoBackup: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));
      
      // Apply theme changes
      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // System theme
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      
      toast.success("Settings saved successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="text-xs">
              <User className="h-4 w-4 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="h-4 w-4 mr-1" />
              Display
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="h-4 w-4 mr-1" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => updateSetting("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={settings.role}
                    disabled
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert Threshold</Label>
                  <Select
                    value={settings.alertThreshold}
                    onValueChange={(value) => updateSetting("alertThreshold", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="medium">Medium & Above</SelectItem>
                      <SelectItem value="high">High & Critical Only</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Minimum severity level for notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select
                    value={settings.notificationFrequency}
                    onValueChange={(value) => updateSetting("notificationFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      onClick={() => updateSetting("theme", "light")}
                      className="justify-start"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      onClick={() => updateSetting("theme", "dark")}
                      className="justify-start"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      onClick={() => updateSetting("theme", "system")}
                      className="justify-start"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing and padding
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable UI animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.animationsEnabled}
                    onCheckedChange={(checked) => updateSetting("animationsEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={([value]) => updateSetting("sessionTimeout", value)}
                      min={5}
                      max={120}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {settings.sessionTimeout}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Privacy Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Control your data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) => updateSetting("dataRetention", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How long to keep historical data
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve FinSight X
                    </p>
                  </div>
                  <Switch
                    checked={settings.shareAnalytics}
                    onCheckedChange={(checked) => updateSetting("shareAnalytics", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily automated data backup
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => updateSetting("autoBackup", checked)}
                  />
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export My Data
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Admin: React.FC = () => {
  const { reduceAnimations, toggleReduceAnimations, savePreferences } = useSettings();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await savePreferences();
      toast({
        title: "Settings saved",
        description: "Your changes have been applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-6 md:py-10 space-y-6 max-w-4xl pb-20 md:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/home" className="text-gray-500 hover:text-guys-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
        <div className="bg-yellow-100 text-yellow-600 font-bold rounded-full w-6 h-6 flex items-center justify-center">
          !
        </div>
        <p className="text-yellow-800 text-sm">
          You're logged in as <span className="font-bold">{user?.username}</span> with admin privileges.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                More settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>
                Settings to optimize app performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Reduce Animations</h3>
                  <p className="text-sm text-gray-500">
                    Minimize animations to improve performance on lower-end devices
                  </p>
                </div>
                <Switch 
                  checked={reduceAnimations} 
                  onCheckedChange={toggleReduceAnimations} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Admin;

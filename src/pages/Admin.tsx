
import React from 'react';
import { useSettings } from '@/contexts/settings';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import CustomNavbar from '@/components/CustomNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import AdBanner from '@/components/AdBanner';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  const handleToggleAds = (checked: boolean) => {
    updateSettings({ showAds: checked });
    toast.success(`Ads have been ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Advertisement Settings</CardTitle>
            <CardDescription>Control the visibility of ads throughout the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-ads">Show advertisements</Label>
              <Switch
                id="show-ads"
                checked={settings.showAds}
                onCheckedChange={handleToggleAds}
              />
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            {settings.showAds 
              ? "Ads are currently enabled and visible to all users." 
              : "Ads are currently disabled and hidden from all users."}
          </CardFooter>
        </Card>

        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle>Ad Preview</CardTitle>
            <CardDescription>Preview how ads will appear to your users</CardDescription>
          </CardHeader>
          <CardContent className="h-32 relative">
            {settings.showAds ? (
              <div className="relative h-full">
                <AdBanner 
                  position="bottom"
                  variant="secondary"
                  className="relative bottom-0 left-0 right-0"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Ads are currently disabled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Example ad at the bottom */}
      {settings.showAds && <AdBanner />}
    </div>
  );
};

export default Admin;

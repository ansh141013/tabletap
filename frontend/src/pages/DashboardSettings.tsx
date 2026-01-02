import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Upload, Printer, Bell, Globe } from 'lucide-react';
import { TableQRCodeModal } from '@/components/dashboard/TableQRCodeModal';

export default function DashboardSettings() {
  const [tableCount, setTableCount] = useState(15);
  const [showQRModal, setShowQRModal] = useState(false);
  const restaurantName = "The Garden Table";
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant preferences</p>
      </div>

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl bg-secondary flex items-center justify-center text-4xl">
              🍽️
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant Name</label>
              <Input defaultValue="The Garden Table" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number</label>
              <Input defaultValue="+1 (555) 123-4567" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input defaultValue="123 Gourmet Street, Food City, FC 12345" />
          </div>
        </CardContent>
      </Card>

      {/* Table Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Table Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Tables</label>
              <Input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                min={1}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code Prefix</label>
              <Input defaultValue="TGT" />
            </div>
          </div>

          <Button variant="outline" onClick={() => setShowQRModal(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Generate QR Codes
          </Button>

          <TableQRCodeModal
            open={showQRModal}
            onOpenChange={setShowQRModal}
            tableCount={tableCount}
            restaurantName={restaurantName}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">New Order Alerts</p>
                <p className="text-sm text-muted-foreground">Play sound for new orders</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">Receive desktop notifications</p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input type="number" step="0.1" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Input defaultValue="USD" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button variant="accent">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

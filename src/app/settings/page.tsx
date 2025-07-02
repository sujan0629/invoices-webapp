
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your company profile and tax settings.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
             <p className="text-sm text-muted-foreground mt-2">You will be able to update your company details and default tax rates here.</p>
        </div>
      </CardContent>
    </Card>
  );
}

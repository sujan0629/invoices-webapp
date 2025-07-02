
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function ClientsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Clients & Projects</CardTitle>
            <CardDescription>Manage your clients and their associated projects.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
            <p className="text-sm text-muted-foreground mt-2">You will be able to add, edit, and view clients and projects here.</p>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

export default function HelpPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Help / Support</CardTitle>
            <CardDescription>Find answers to your questions and get support.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">The AI Assistant and support documentation are coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}

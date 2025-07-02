'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChatWidget } from '@/context/chat-widget';
import Image from 'next/image';
import { Mail, Phone, User, MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function HelpPage() {
  const { setChatOpen } = useChatWidget();
  const { settings } = useSettings();
  const companyProfile = settings.company;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          {companyProfile.logoUrl && (
            <Image
              src={companyProfile.logoUrl}
              alt={`${companyProfile.name} Logo`}
              width={150}
              height={50}
              data-ai-hint="company logo"
              className="mx-auto mb-4"
            />
          )}
          <CardTitle className="text-3xl">{companyProfile.name}</CardTitle>
          <CardDescription>We're here to help you.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a
                  href="mailto:info@codelitsstudio.com"
                  className="hover:underline"
                >
                  info@codelitsstudio.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a
                  href="mailto:contact@codelitsstudio.com"
                  className="hover:underline"
                >
                  contact@codelitsstudio.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>+977 9709045674</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>
                  MD:{' '}
                  <a
                    href="mailto:sujanbhatta@codelitsstudio.com"
                    className="hover:underline"
                  >
                    sujanbhatta@codelitsstudio.com
                  </a>
                </span>
              </div>
            </div>
          </div>
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Need a quick answer?</CardTitle>
              <CardDescription>
                Our AI assistant is available 24/7 to help you with your
                questions about using the app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setChatOpen(true)} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Open AI Assistant
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

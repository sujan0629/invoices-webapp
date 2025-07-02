'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatWidgetContextType {
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

export const ChatWidgetProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);

  const value = { isChatOpen, setChatOpen };

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
};

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (context === undefined) {
    throw new Error('useChatWidget must be used within a ChatWidgetProvider');
  }
  return context;
};

'use client';

import { useState } from 'react';
import { HomeChat } from '@/components/HomeChat';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const handleStartChat = (message: string) => {
    setInitialMessage(message);
    setHasStartedChat(true);
  };

  if (hasStartedChat) {
    return <ChatInterface initialMessage={initialMessage} />;
  }

  return <HomeChat onStartChat={handleStartChat} />;
}

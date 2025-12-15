"use client";

import React from 'react';
import PageWrapper from '@/components/global/PageWrapper';
import ChatInterface from '@/components/features/ChatInterface';

const ChatbotPage = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Conversation History Panel */}
              <div className="md:col-span-1 bg-black/20 p-4 rounded-lg">
                  <h3 className="font-bold text-xl mb-4 text-text-primary">History</h3>
                  <div className="space-y-2">
                      <div className="p-2 bg-bg-secondary rounded-md text-sm cursor-pointer hover:bg-bg-primary">
                          <p className="font-semibold truncate">Q4 Budget Planning</p>
                          <p className="text-xs text-text-secondary">3 messages</p>
                      </div>
                       <div className="p-2 bg-bg-primary rounded-md text-sm cursor-pointer hover:bg-bg-secondary">
                          <p className="font-semibold truncate">Initial Setup</p>
                          <p className="text-xs text-text-secondary">5 messages</p>
                      </div>
                  </div>
              </div>
              {/* Main Chat Interface */}
              <div className="md:col-span-3">
                <ChatInterface />
              </div>
          </div>
      </div>
    </PageWrapper>
  );
};

export default ChatbotPage;

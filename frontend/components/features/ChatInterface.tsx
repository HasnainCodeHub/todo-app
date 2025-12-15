"use client";

import { motion } from "framer-motion";
import { Mic, Send, Bot, Code } from "lucide-react";

const Message = ({ from, text, isToolCall }: { from: 'user' | 'ai', text: string, isToolCall?: boolean }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${from === 'user' ? 'justify-end' : ''}`}
        >
            {from === 'ai' && <Bot className="w-8 h-8 text-accent-secondary flex-shrink-0" />}
            <div className={`p-4 rounded-lg max-w-lg ${from === 'user' ? 'bg-blue-600 text-white' : 'bg-bg-secondary text-text-primary'}`}>
                <p>{text}</p>
                {isToolCall && (
                    <div className="mt-2 border-t border-white/10 pt-2">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Code size={14} />
                            <span>Tool Call: `create_task`</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

const ChatInterface = () => {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-lg h-[70vh] flex flex-col">
        <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-text-primary">AI Task Agent – MCP Powered</h3>
        </div>
        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
            <Message from="user" text="Can you add a high-priority task for me to 'Review Q4 budget report' by tomorrow?" />
            <Message from="ai" text="Of course. I've created the task 'Review Q4 budget report' with high priority, due tomorrow." isToolCall={true} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Bot size={16} className="text-accent-secondary" />
                <span className="text-sm text-text-secondary animate-pulse">AI is typing...</span>
            </motion.div>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center gap-4">
            <input 
                type="text"
                placeholder="Talk to your tasks..."
                className="w-full bg-bg-primary p-3 rounded-md border border-white/10 focus:ring-2 focus:ring-accent-primary outline-none"
            />
            <button className="p-3 bg-bg-primary rounded-md hover:bg-white/5"><Mic className="text-text-secondary" /></button>
            <button className="p-3 bg-accent-secondary rounded-md hover:bg-accent-primary"><Send className="text-bg-primary" /></button>
        </div>
    </div>
  );
};

export default ChatInterface;

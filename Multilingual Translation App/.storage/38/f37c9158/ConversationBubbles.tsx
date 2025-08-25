import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { LANGUAGES } from "./LanguageSelector";

export interface ConversationMessage {
  id: string;
  originalText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: Date;
  speaker: "from" | "to";
}

interface ConversationBubblesProps {
  messages: ConversationMessage[];
  fromLang: string;
  toLang: string;
  onSpeak: (text: string, lang: string) => void;
}

export function ConversationBubbles({ messages, fromLang, toLang, onSpeak }: ConversationBubblesProps) {
  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || "🌐";
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Start speaking to see your conversation here</p>
        <p className="text-xs mt-1">Messages will appear as speech bubbles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message) => {
        const isFromSpeaker = message.speaker === "from";
        const speakerLang = message.fromLang;
        const targetLang = message.toLang;
        
        return (
          <div key={message.id} className={`flex ${isFromSpeaker ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md space-y-2 ${isFromSpeaker ? 'items-end' : 'items-start'} flex flex-col`}>
              {/* Original Message */}
              <div className={`rounded-2xl px-4 py-3 ${
                isFromSpeaker 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {getLanguageFlag(speakerLang)} {getLanguageName(speakerLang)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSpeak(message.originalText, speakerLang)}
                    className={`h-5 w-5 p-0 ${isFromSpeaker ? 'hover:bg-blue-400' : 'hover:bg-gray-300'}`}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm leading-relaxed">{message.originalText}</p>
              </div>
              
              {/* Translation */}
              <div className={`rounded-2xl px-4 py-3 border-2 ${
                isFromSpeaker 
                  ? 'border-blue-200 bg-blue-50 text-blue-900 rounded-br-sm' 
                  : 'border-green-200 bg-green-50 text-green-900 rounded-bl-sm'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {getLanguageFlag(targetLang)} {getLanguageName(targetLang)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSpeak(message.translatedText, targetLang)}
                    className={`h-5 w-5 p-0 ${
                      isFromSpeaker ? 'hover:bg-blue-100' : 'hover:bg-green-100'
                    }`}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm leading-relaxed">{message.translatedText}</p>
              </div>
              
              {/* Timestamp */}
              <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
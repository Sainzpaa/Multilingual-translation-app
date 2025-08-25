import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, ArrowLeftRight, Loader2, Play, Pause } from "lucide-react";
import { LanguagePair, LANGUAGES } from "./LanguageSelector";
import { ConversationBubbles, ConversationMessage } from "./ConversationBubbles";
import { useToast } from "@/components/ui/use-toast";

interface VoiceTranslationCardProps {
  id: string;
  fromLang: string;
  toLang: string;
  onFromLangChange: (value: string) => void;
  onToLangChange: (value: string) => void;
  onSwap: () => void;
  onTranslation: (sourceText: string, translatedText: string, fromLang: string, toLang: string) => void;
}

export function VoiceTranslationCard({
  id,
  fromLang,
  toLang,
  onFromLangChange,
  onToLangChange,
  onSwap,
  onTranslation
}: VoiceTranslationCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentInputLang, setCurrentInputLang] = useState<"from" | "to">("from");
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const WindowWithSpeech = window as typeof window & {
        webkitSpeechRecognition: typeof SpeechRecognition;
        SpeechRecognition: typeof SpeechRecognition;
      };
      const SpeechRecognition = WindowWithSpeech.webkitSpeechRecognition || WindowWithSpeech.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          handleTranslation(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setIsProcessing(false);
          toast({
            title: "Speech Recognition Error",
            description: "Could not process audio. Please try again.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          setIsProcessing(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }

      const inputLang = currentInputLang === "from" ? fromLang : toLang;
      recognitionRef.current.lang = inputLang;
      
      setIsRecording(true);
      setIsProcessing(true);
      recognitionRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleTranslation = async (text: string) => {
    setIsProcessing(true);
    
    // Determine source and target languages based on current input
    const sourceLang = currentInputLang === "from" ? fromLang : toLang;
    const targetLang = currentInputLang === "from" ? toLang : fromLang;

    // Mock translation (replace with real API)
    const mockTranslate = (text: string, from: string, to: string) => {
      const translations: { [key: string]: { [key: string]: string } } = {
        "hello": {
          "hi": "नमस्ते",
          "bn": "হ্যালো", 
          "ar": "مرحبا",
          "sw": "Hujambo",
          "es": "Hola",
          "pt": "Olá",
          "en": "Hello"
        },
        "how are you": {
          "hi": "आप कैसे हैं?",
          "bn": "আপনি কেমন আছেন?",
          "ar": "كيف حالك؟",
          "sw": "Hujambo, habari?",
          "es": "¿Cómo estás?",
          "pt": "Como você está?",
          "en": "How are you?"
        },
        "thank you": {
          "hi": "धन्यवाद",
          "bn": "ধন্যবাদ",
          "ar": "شكرا لك",
          "sw": "Asante",
          "es": "Gracias",
          "pt": "Obrigado",
          "en": "Thank you"
        }
      };

      const lowerText = text.toLowerCase();
      return translations[lowerText]?.[to] || `[${LANGUAGES.find(l => l.code === to)?.name} translation: "${text}"]`;
    };

    setTimeout(() => {
      const translation = mockTranslate(text, sourceLang, targetLang);
      
      // Add to conversation history
      const newMessage: ConversationMessage = {
        id: Date.now().toString(),
        originalText: text,
        translatedText: translation,
        fromLang: sourceLang,
        toLang: targetLang,
        timestamp: new Date(),
        speaker: currentInputLang
      };
      
      setConversation(prev => [...prev, newMessage]);
      onTranslation(text, translation, sourceLang, targetLang);
      
      // Auto-play translation
      speakText(translation, targetLang);
      setIsProcessing(false);
    }, 1000);
  };

  const speakText = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Speech Error",
          description: "Could not play audio for this language.",
          variant: "destructive",
        });
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const switchInputLanguage = (direction: "from" | "to") => {
    setCurrentInputLang(direction);
    setLastTranscript("");
    setLastTranslation("");
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || "🌐";
  };

  const currentInputLanguage = currentInputLang === "from" ? fromLang : toLang;
  const currentOutputLanguage = currentInputLang === "from" ? toLang : fromLang;

  return (
    <Card className="w-full border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-blue-600" />
          Voice Conversation Mode
        </CardTitle>
        <LanguagePair
          fromLang={fromLang}
          toLang={toLang}
          onFromLangChange={onFromLangChange}
          onToLangChange={onToLangChange}
          onSwap={onSwap}
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Direct Voice Recording Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Language A Button */}
          <Button
            onClick={() => startRecordingInLanguage("from")}
            disabled={isProcessing}
            className={`h-24 p-4 flex flex-col items-center gap-2 ${
              isRecording && currentInputLang === "from"
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isRecording && currentInputLang === "from" ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{getLanguageFlag(fromLang)}</span>
              <span>{getLanguageName(fromLang)}</span>
            </div>
            <span className="text-xs opacity-90">
              {isRecording && currentInputLang === "from" ? "Listening..." : "Tap to speak"}
            </span>
          </Button>

          {/* Language B Button */}
          <Button
            onClick={() => startRecordingInLanguage("to")}
            disabled={isProcessing}
            className={`h-24 p-4 flex flex-col items-center gap-2 ${
              isRecording && currentInputLang === "to"
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isRecording && currentInputLang === "to" ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{getLanguageFlag(toLang)}</span>
              <span>{getLanguageName(toLang)}</span>
            </div>
            <span className="text-xs opacity-90">
              {isRecording && currentInputLang === "to" ? "Listening..." : "Tap to speak"}
            </span>
          </Button>
        </div>

        {/* Processing Status */}
        {isProcessing && !isRecording && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">Processing translation...</p>
          </div>
        )}</to_replace>
</Editor.edit_file_by_replace>

<Editor.edit_file_by_replace>
<file_name>src/components/VoiceTranslationCard.tsx</file_name>
<to_replace>  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }

      const inputLang = currentInputLang === "from" ? fromLang : toLang;
      recognitionRef.current.lang = inputLang;
      
      setIsRecording(true);
      setIsProcessing(true);
      recognitionRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsProcessing(false);
    }
  };</to_replace>
<new_content>  const startRecordingInLanguage = async (direction: "from" | "to") => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }

      // Set the input language direction
      setCurrentInputLang(direction);
      
      const inputLang = direction === "from" ? fromLang : toLang;
      recognitionRef.current.lang = inputLang;
      
      setIsRecording(true);
      setIsProcessing(true);
      recognitionRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

        {/* Quick Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Quick Tips:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Select your input language above</li>
            <li>• Hold the microphone button and speak clearly</li>
            <li>• Translation will be spoken automatically</li>
            <li>• Switch input languages for back-and-forth conversation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
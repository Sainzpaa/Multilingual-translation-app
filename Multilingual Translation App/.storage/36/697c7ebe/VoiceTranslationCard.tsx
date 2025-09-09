import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, ArrowLeftRight, Loader2, Play, Pause } from "lucide-react";
import { LanguagePair, LANGUAGES } from "./LanguageSelector";
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
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastTranslation, setLastTranslation] = useState("");
  const [currentInputLang, setCurrentInputLang] = useState<"from" | "to">("from");
  const [isPlaying, setIsPlaying] = useState(false);
  
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
          setLastTranscript(transcript);
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
      setLastTranslation(translation);
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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
        {/* Language Input Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Choose Input Language:</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={currentInputLang === "from" ? "default" : "outline"}
              onClick={() => switchInputLanguage("from")}
              className="h-auto p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLanguageFlag(fromLang)}</span>
                <span className="font-medium">{getLanguageName(fromLang)}</span>
              </div>
              <span className="text-xs opacity-80">Speak in this language</span>
            </Button>
            
            <Button
              variant={currentInputLang === "to" ? "default" : "outline"}
              onClick={() => switchInputLanguage("to")}
              className="h-auto p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLanguageFlag(toLang)}</span>
                <span className="font-medium">{getLanguageName(toLang)}</span>
              </div>
              <span className="text-xs opacity-80">Speak in this language</span>
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Input: {getLanguageFlag(currentInputLanguage)} {getLanguageName(currentInputLanguage)}
              {" → "}
              Output: {getLanguageFlag(currentOutputLanguage)} {getLanguageName(currentOutputLanguage)}
            </Badge>
          </div>
          
          {lastTranscript && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-600">You said:</span>
                <p className="bg-white p-2 rounded mt-1">{lastTranscript}</p>
              </div>
              
              {lastTranslation && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Translation:</span>
                  <div className="bg-blue-50 p-2 rounded mt-1 flex items-center justify-between">
                    <p>{lastTranslation}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(lastTranslation, currentOutputLanguage)}
                      disabled={isPlaying}
                      className="h-8 w-8 p-0"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={toggleRecording}
            disabled={isProcessing && !isRecording}
            className={`h-20 w-20 rounded-full text-white ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isProcessing && !isRecording ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-sm font-medium">
              {isRecording 
                ? "🎤 Listening..." 
                : isProcessing 
                ? "⚙️ Processing..." 
                : `🎯 Tap to speak in ${getLanguageName(currentInputLanguage)}`
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Output will be in {getLanguageName(currentOutputLanguage)}
            </p>
          </div>
        </div>

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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Volume2, Trash2 } from "lucide-react";
import { LanguagePair, LANGUAGES } from "./LanguageSelector";
import { useToast } from "@/components/ui/use-toast";

export interface TranslationResult {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: Date;
}

interface TranslationCardProps {
  id: string;
  fromLang: string;
  toLang: string;
  onFromLangChange: (value: string) => void;
  onToLangChange: (value: string) => void;
  onSwap: () => void;
  onRemove: () => void;
  onTranslate: (sourceText: string, fromLang: string, toLang: string) => void;
  isTranslating?: boolean;
}

export function TranslationCard({
  id,
  fromLang,
  toLang,
  onFromLangChange,
  onToLangChange,
  onSwap,
  onRemove,
  onTranslate,
  isTranslating = false
}: TranslationCardProps) {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const { toast } = useToast();

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text to translate",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return;
    }

    if (!fromLang || !toLang) {
      toast({
        title: "Languages not selected",
        description: "Please select both source and target languages.",
        variant: "destructive",
      });
      return;
    }

    if (fromLang === toLang) {
      toast({
        title: "Same languages selected",
        description: "Source and target languages cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    // Simulate translation API call
    const mockTranslate = () => {
      // Mock translation for demonstration
      const translations: { [key: string]: string } = {
        "hello": {
          "hi": "नमस्ते",
          "bn": "হ্যালো",
          "ar": "مرحبا",
          "sw": "Hujambo",
          "es": "Hola",
          "pt": "Olá",
          "fr": "Bonjour",
          "zh": "你好",
          "id": "Halo",
          "th": "สวัสดี",
          "vi": "Xin chào",
          "tr": "Merhaba",
          "ur": "السلام علیکم",
          "fa": "سلام"
        },
        "thank you": {
          "hi": "धन्यवाद",
          "bn": "ধন্যবাদ",
          "ar": "شكرا لك",
          "sw": "Asante",
          "es": "Gracias",
          "pt": "Obrigado",
          "fr": "Merci",
          "zh": "谢谢",
          "id": "Terima kasih",
          "th": "ขอบคุณ",
          "vi": "Cảm ơn",
          "tr": "Teşekkür ederim",
          "ur": "شکریہ",
          "fa": "متشکرم"
        }
      };

      const lowerText = sourceText.toLowerCase();
      const translation = translations[lowerText]?.[toLang];
      
      if (translation) {
        return translation;
      } else {
        // Fallback mock translation
        return `[${LANGUAGES.find(l => l.code === toLang)?.name} translation of "${sourceText}"]`;
      }
    };

    setTimeout(() => {
      const result = mockTranslate();
      setTranslatedText(result);
      onTranslate(sourceText, fromLang, toLang);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const speakText = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Translation Pair</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <LanguagePair
          fromLang={fromLang}
          toLang={toLang}
          onFromLangChange={onFromLangChange}
          onToLangChange={onToLangChange}
          onSwap={onSwap}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Source Text</label>
              {sourceText && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(sourceText)}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(sourceText, fromLang)}
                    className="h-7 w-7 p-0"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Translated Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Translation</label>
              {translatedText && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText)}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(translatedText, toLang)}
                    className="h-7 w-7 p-0"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="min-h-[100px] resize-none bg-gray-50"
            />
          </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim() || !fromLang || !toLang}
          className="w-full"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </CardContent>
    </Card>
  );
}
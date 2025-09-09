import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, Clock } from "lucide-react";
import { TranslationResult } from "./TranslationCard";
import { LANGUAGES } from "./LanguageSelector";
import { useToast } from "@/components/ui/use-toast";

interface TranslationHistoryProps {
  history: TranslationResult[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export function TranslationHistory({ history, onClearHistory, onRemoveItem }: TranslationHistoryProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || "🌐";
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Translation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No translations yet. Start translating to see your history here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Translation History ({history.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            className="text-red-500 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getLanguageFlag(item.fromLang)} {getLanguageName(item.fromLang)}
                      {" → "}
                      {getLanguageFlag(item.toLang)} {getLanguageName(item.toLang)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Source:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.sourceText)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-800 bg-gray-100 p-2 rounded">
                      {item.sourceText}
                    </p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Translation:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.translatedText)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-800 bg-blue-50 p-2 rounded">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
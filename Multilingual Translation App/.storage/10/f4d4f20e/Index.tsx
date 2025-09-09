import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Languages, Globe, Zap } from "lucide-react";
import { TranslationCard, TranslationResult } from "@/components/TranslationCard";
import { TranslationHistory } from "@/components/TranslationHistory";
import { useToast } from "@/components/ui/use-toast";

interface TranslationPair {
  id: string;
  fromLang: string;
  toLang: string;
}

export default function Index() {
  const [translationPairs, setTranslationPairs] = useState<TranslationPair[]>([
    { id: "1", fromLang: "en", toLang: "hi" }
  ]);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState<string[]>([]);
  const { toast } = useToast();

  const addTranslationPair = () => {
    const newPair: TranslationPair = {
      id: Date.now().toString(),
      fromLang: "en",
      toLang: "hi"
    };
    setTranslationPairs([...translationPairs, newPair]);
  };

  const removeTranslationPair = (id: string) => {
    if (translationPairs.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one translation pair must remain.",
        variant: "destructive",
      });
      return;
    }
    setTranslationPairs(translationPairs.filter(pair => pair.id !== id));
  };

  const updateTranslationPair = (id: string, updates: Partial<TranslationPair>) => {
    setTranslationPairs(pairs =>
      pairs.map(pair =>
        pair.id === id ? { ...pair, ...updates } : pair
      )
    );
  };

  const swapLanguages = (id: string) => {
    setTranslationPairs(pairs =>
      pairs.map(pair =>
        pair.id === id
          ? { ...pair, fromLang: pair.toLang, toLang: pair.fromLang }
          : pair
      )
    );
  };

  const handleTranslation = (sourceText: string, fromLang: string, toLang: string) => {
    // This would typically call a real translation API
    // For now, we'll simulate it and add to history
    setTimeout(() => {
      const result: TranslationResult = {
        id: Date.now().toString(),
        sourceText,
        translatedText: `[Translation of "${sourceText}" from ${fromLang} to ${toLang}]`,
        fromLang,
        toLang,
        timestamp: new Date()
      };
      setHistory(prev => [result, ...prev]);
    }, 1000);
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All translation history has been removed.",
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Global Translator</h1>
                <p className="text-sm text-gray-600">Multilingual & Simultaneous Translation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {translationPairs.length} active pair{translationPairs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Connect the World Through Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Globe className="h-8 w-8" />
                <h3 className="font-semibold">25+ Languages</h3>
                <p className="text-sm text-blue-100">Focus on developing countries</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8" />
                <h3 className="font-semibold">Real-time Translation</h3>
                <p className="text-sm text-blue-100">Instant results</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Languages className="h-8 w-8" />
                <h3 className="font-semibold">Simultaneous Pairs</h3>
                <p className="text-sm text-blue-100">Multiple translations at once</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Translation Pairs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Translation Pairs</h2>
              <Button onClick={addTranslationPair} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Pair
              </Button>
            </div>

            <div className="space-y-4">
              {translationPairs.map((pair) => (
                <TranslationCard
                  key={pair.id}
                  id={pair.id}
                  fromLang={pair.fromLang}
                  toLang={pair.toLang}
                  onFromLangChange={(lang) => updateTranslationPair(pair.id, { fromLang: lang })}
                  onToLangChange={(lang) => updateTranslationPair(pair.id, { toLang: lang })}
                  onSwap={() => swapLanguages(pair.id)}
                  onRemove={() => removeTranslationPair(pair.id)}
                  onTranslate={handleTranslation}
                  isTranslating={isTranslating.includes(pair.id)}
                />
              ))}
            </div>

            {/* Quick Translation Examples */}
            <Card className="bg-gray-50 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Quick Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-medium">🇮🇳 Hindi</div>
                    <div className="text-xs text-gray-600">नमस्ते</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-medium">🇰🇪 Swahili</div>
                    <div className="text-xs text-gray-600">Hujambo</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-medium">🇸🇦 Arabic</div>
                    <div className="text-xs text-gray-600">مرحبا</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-medium">🇧🇷 Portuguese</div>
                    <div className="text-xs text-gray-600">Olá</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Try typing "hello" or "thank you" for demo translations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Translation History */}
          <div className="lg:col-span-1">
            <TranslationHistory
              history={history}
              onClearHistory={clearHistory}
              onRemoveItem={removeHistoryItem}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Supporting languages from developing countries • Built with ❤️ for global communication</p>
        </footer>
      </div>
    </div>
  );
}
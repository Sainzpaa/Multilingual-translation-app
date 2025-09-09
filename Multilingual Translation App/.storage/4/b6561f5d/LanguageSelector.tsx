import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

export interface Language {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export const LANGUAGES: Language[] = [
  // Major developing country languages
  { code: "hi", name: "Hindi", flag: "🇮🇳", region: "India" },
  { code: "bn", name: "Bengali", flag: "🇧🇩", region: "Bangladesh/India" },
  { code: "ur", name: "Urdu", flag: "🇵🇰", region: "Pakistan" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", region: "Middle East/Africa" },
  { code: "sw", name: "Swahili", flag: "🇰🇪", region: "East Africa" },
  { code: "ha", name: "Hausa", flag: "🇳🇬", region: "West Africa" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬", region: "Nigeria" },
  { code: "ig", name: "Igbo", flag: "🇳🇬", region: "Nigeria" },
  { code: "am", name: "Amharic", flag: "🇪🇹", region: "Ethiopia" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", region: "Brazil/Africa" },
  { code: "es", name: "Spanish", flag: "🇲🇽", region: "Latin America" },
  { code: "id", name: "Indonesian", flag: "🇮🇩", region: "Indonesia" },
  { code: "ms", name: "Malay", flag: "🇲🇾", region: "Malaysia" },
  { code: "tl", name: "Filipino", flag: "🇵🇭", region: "Philippines" },
  { code: "th", name: "Thai", flag: "🇹🇭", region: "Thailand" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳", region: "Vietnam" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", region: "Turkey" },
  { code: "fa", name: "Persian", flag: "🇮🇷", region: "Iran" },
  { code: "zu", name: "Zulu", flag: "🇿🇦", region: "South Africa" },
  { code: "xh", name: "Xhosa", flag: "🇿🇦", region: "South Africa" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦", region: "South Africa" },
  { code: "my", name: "Myanmar", flag: "🇲🇲", region: "Myanmar" },
  { code: "km", name: "Khmer", flag: "🇰🇭", region: "Cambodia" },
  { code: "ne", name: "Nepali", flag: "🇳🇵", region: "Nepal" },
  { code: "si", name: "Sinhala", flag: "🇱🇰", region: "Sri Lanka" },
  // Common reference languages
  { code: "en", name: "English", flag: "🇺🇸", region: "International" },
  { code: "fr", name: "French", flag: "🇫🇷", region: "International" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", region: "China" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function LanguageSelector({ value, onChange, label, placeholder = "Select language" }: LanguageSelectorProps) {
  const selectedLanguage = LANGUAGES.find(lang => lang.code === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedLanguage && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span>{selectedLanguage.name}</span>
                <span className="text-xs text-gray-500">({selectedLanguage.region})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                <span className="text-xs text-gray-500">({language.region})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface LanguagePairProps {
  fromLang: string;
  toLang: string;
  onFromLangChange: (value: string) => void;
  onToLangChange: (value: string) => void;
  onSwap: () => void;
}

export function LanguagePair({ fromLang, toLang, onFromLangChange, onToLangChange, onSwap }: LanguagePairProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <LanguageSelector
          value={fromLang}
          onChange={onFromLangChange}
          label="From"
          placeholder="Source language"
        />
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onSwap}
        className="mb-0 hover:bg-blue-50"
        title="Swap languages"
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>
      
      <div className="flex-1">
        <LanguageSelector
          value={toLang}
          onChange={onToLangChange}
          label="To"
          placeholder="Target language"
        />
      </div>
    </div>
  );
}
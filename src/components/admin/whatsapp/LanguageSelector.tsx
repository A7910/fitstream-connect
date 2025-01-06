import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
}

const LanguageSelector = ({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="language" className="text-sm font-medium">
        Language
      </label>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en_US">English(US)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
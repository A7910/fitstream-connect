import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  name: string;
  language: string;
  status: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  isLoadingTemplates: boolean;
  onTemplateChange: (value: string) => void;
}

const TemplateSelector = ({
  templates,
  selectedTemplate,
  isLoadingTemplates,
  onTemplateChange,
}: TemplateSelectorProps) => {
  const formatTemplateName = (name: string) => {
    const words = name.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-2">
      <label htmlFor="template" className="text-sm font-medium">
        Message Template
      </label>
      <Select value={selectedTemplate} onValueChange={onTemplateChange}>
        <SelectTrigger>
          <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem 
              key={`${template.name}_${template.language}`} 
              value={template.name}
            >
              {formatTemplateName(template.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateSelector;
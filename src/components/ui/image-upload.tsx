import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Trash2, Upload } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  children,
  disabled = false 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    if (!disabled) {
      setPreview(null);
      onRemove();
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
        disabled={disabled}
      />
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : children ? (
        <label htmlFor="image-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          {children}
        </label>
      ) : (
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-secondary'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
          </div>
        </label>
      )}
    </div>
  );
}
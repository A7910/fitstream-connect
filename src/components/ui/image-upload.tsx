import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Trash2, Upload } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary"
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
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
    <div className="flex gap-2 items-center">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      {preview ? (
        <div className="flex items-center gap-2">
          <img
            src={preview}
            alt="Preview"
            className="w-10 h-10 rounded-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="cursor-pointer"
        >
          <Button variant="outline" size="sm" className="gap-2" type="button">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </label>
      )}
    </div>
  );
}
import { ReactNode } from "react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  children?: ReactNode;
}

export function ImageUpload({ value, onChange, onRemove, children }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        {children}
      </label>
    </div>
  );
}

import { Input } from "./input";
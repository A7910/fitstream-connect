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
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        {children || <div className="bg-gray-200 p-2 rounded-full">Upload</div>}
      </label>
    </div>
  );
}
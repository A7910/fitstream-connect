import * as React from "react";
import { Input } from "./input";

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          ref={ref}
          {...props}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="#000000"
        />
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";
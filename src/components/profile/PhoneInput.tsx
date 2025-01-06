import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { parsePhoneNumber, AsYouType, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { countries } from "@/lib/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneInput = ({ value, onChange, error }: PhoneInputProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("US");

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    const phoneNumber = value.replace(/\D/g, '');
    const newValue = `+${getCountryCallingCode(country)}${phoneNumber}`;
    onChange(newValue);
    setOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatter = new AsYouType(selectedCountry);
    const formattedNumber = formatter.input(e.target.value);
    onChange(formattedNumber);
  };

  const isValidNumber = (phoneNumber: string) => {
    try {
      const parsed = parsePhoneNumber(phoneNumber, selectedCountry);
      return parsed?.isValid() || false;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber" className="text-sm font-poppins text-gray-600">
        Phone Number
      </Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[140px] justify-between"
            >
              {selectedCountry ? (
                <span>
                  {countries.find((c) => c.code === selectedCountry)?.flag}{" "}
                  +{getCountryCallingCode(selectedCountry)}
                </span>
              ) : (
                "Select country"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code} +${getCountryCallingCode(country.code as CountryCode)}`}
                    onSelect={() => handleCountrySelect(country.code as CountryCode)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountry === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {country.flag} {country.name} (+{getCountryCallingCode(country.code as CountryCode)})
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          id="phoneNumber"
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          className={cn(
            "font-poppins flex-1",
            !isValidNumber(value) && value && "border-red-500"
          )}
          placeholder="Enter phone number"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {value && !isValidNumber(value) && (
        <p className="text-sm text-red-500">Please enter a valid phone number</p>
      )}
    </div>
  );
};
import { CountryCode } from 'libphonenumber-js';

interface Country {
  name: string;
  code: CountryCode;
  flag: string;
}

export const countries: Country[] = [
  { name: 'United States', code: "US", flag: '🇺🇸' },
  { name: 'Canada', code: "CA", flag: '🇨🇦' },
  { name: 'United Kingdom', code: "GB", flag: '🇬🇧' },
  { name: 'Australia', code: "AU", flag: '🇦🇺' },
  { name: 'India', code: "IN", flag: '🇮🇳' },
  { name: 'Germany', code: "DE", flag: '🇩🇪' },
  { name: 'France', code: "FR", flag: '🇫🇷' },
  { name: 'Italy', code: "IT", flag: '🇮🇹' },
  { name: 'Spain', code: "ES", flag: '🇪🇸' },
  { name: 'Japan', code: "JP", flag: '🇯🇵' },
  { name: 'China', code: "CN", flag: '🇨🇳' },
  { name: 'Brazil', code: "BR", flag: '🇧🇷' },
  { name: 'Mexico', code: "MX", flag: '🇲🇽' },
  { name: 'Russia', code: "RU", flag: '🇷🇺' },
  { name: 'South Korea', code: "KR", flag: '🇰🇷' }
];
"use client";

import { countries } from "@/lib/countries";

// Function to convert 2-letter country code to a flag emoji
const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "";
    // Regional Indicator Symbol Letter A is 0x1F1E6
    // We offset the character code with the country code's character codes
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

const CountryCodeDropdown = ({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => {
    return (
        <select 
            value={value}
            onChange={onChange}
            className="bg-bg-primary border border-white/20 rounded-l-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        >
            {countries.map(c => (
                <option key={c.alpha2} value={c.dialCode}>
                    {getFlagEmoji(c.alpha2)} {c.dialCode}
                </option>
            ))}
        </select>
    )
}

export default CountryCodeDropdown;

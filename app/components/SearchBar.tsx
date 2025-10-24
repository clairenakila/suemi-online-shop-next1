"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  options?: string[];
  storageKey?: string; // 👈 optional custom key for per-page persistence
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  options = [],
  storageKey,
}: SearchBarProps) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 👇 Use dynamic key based on placeholder if not provided
  const key =
    storageKey || `search_${placeholder.toLowerCase().replace(/\s+/g, "_")}`;

  // ✅ Load saved value safely once
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved && saved !== value) {
      setTimeout(() => onChange(saved), 0); // avoid sync re-render loop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once only

  // ✅ Save to localStorage whenever value changes
  useEffect(() => {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }, [value, key]);

  // ✅ Filter dropdown options
  useEffect(() => {
    if (!value) {
      setFilteredOptions([]);
      setShowDropdown(false);
      return;
    }

    const filtered = options.filter((opt) =>
      opt.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [value, options]);

  const handleSelect = (option: string) => {
    onChange(option);
    setShowDropdown(false);
  };

  return (
    <div className="position-relative w-100" style={{ maxWidth: "300px" }}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(filteredOptions.length > 0)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
        spellCheck={false}
      />

      {showDropdown && (
        <ul
          className="list-group position-absolute w-100"
          style={{ top: "100%", zIndex: 50 }}
        >
          {filteredOptions.map((opt, i) => (
            <li
              key={i}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onMouseDown={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

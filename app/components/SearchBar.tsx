"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[]; // list of values to autocomplete
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  options,
}: SearchBarProps) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load previous search from localStorage on mount
  useEffect(() => {
    const savedSearch = localStorage.getItem("employeeSearch") || "";
    if (savedSearch) {
      onChange(savedSearch);
    }
  }, []);

  // Save current search to localStorage whenever it changes
  useEffect(() => {
    if (value) {
      localStorage.setItem("employeeSearch", value);
    } else {
      localStorage.removeItem("employeeSearch");
    }
  }, [value]);

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

  function handleSelect(option: string) {
    onChange(option);
    setShowDropdown(false);
  }

  return (
    <div
      className="search-bar-container position-relative w-100"
      style={{ maxWidth: "300px" }}
    >
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(filteredOptions.length > 0)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="new-password" // prevents browser autocomplete
        name="employee-search" // avoid common names like "name" or "email"
        spellCheck={false} // prevents spell suggestions
      />

      {showDropdown && (
        <ul
          className="list-group position-absolute w-100"
          style={{ top: "100%", zIndex: 50 }}
        >
          {filteredOptions.map((opt, index) => (
            <li
              key={index}
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

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBox = React.memo(function SearchBox({ value, onChange, onClear, onSubmit, onKeyPress, placeholder = "Seeking WHAT" }) {
  const inputRef = useRef(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute -inset-1.5 bg-gradient-to-r from-uew-navy via-uew-red to-uew-gold rounded-2xl blur-sm opacity-15 group-hover:opacity-35 transition duration-300 pointer-events-none" />

      <form onSubmit={onSubmit} className="relative flex items-center bg-white rounded-2xl shadow-md border border-slate-200/90 transition-all duration-200 focus-within:ring-4 focus-within:ring-uew-red/10 focus-within:border-uew-red/60">
        <div className="pl-4 md:pl-5 pr-2 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-uew-red transition-transform duration-200 group-hover:scale-110" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit?.(e);
            } else {
              onKeyPress?.(e);
            }
          }}
          placeholder={placeholder}
          className="w-full py-4 md:py-4.5 pr-12 text-base md:text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-4 p-1.5 rounded-full text-slate-300 hover:text-uew-red hover:bg-red-50 transition-all duration-200 cursor-pointer"
            title="Clear search"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </form>

      <p className="mt-2 text-center text-[11px] text-slate-400 font-medium">
        Press Enter to search &middot; Try &ldquo;Accra&rdquo;, &ldquo;Fees&rdquo;, or &ldquo;Past Questions&rdquo;
      </p>
    </div>
  );
});

export default SearchBox;

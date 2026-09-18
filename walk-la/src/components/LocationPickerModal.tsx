import React, { useState } from 'react';
import { X, Search, MapPin, Check, Shield } from 'lucide-react';
import { LocationPoint } from '../types';
import { searchLocations } from "../services/onemap";

interface LocationPickerModalProps {
  isOpen: boolean;
  title: string;
  currentLocation: LocationPoint;
  onSelect: (location: LocationPoint) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  title,
  currentLocation,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async (query: string) => {
  setSearchQuery(query);

  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    setIsSearching(true);

    const results = await searchLocations(query);

    setSearchResults(results.results || []);
  } catch (error) {
    console.error("OneMap search failed:", error);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#101822] rounded-t-[28px] sm:rounded-[28px] border border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        id="location-picker-modal"
      >
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-[16px] font-bold text-white tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2 bg-[#172330] px-3.5 py-2.5 rounded-xl border border-slate-700/60">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search station, covered linkway, or mall..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none text-white text-[13.5px] placeholder-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
            Sheltered Hubs in Singapore
          </span>

          {searchResults.map((loc) => {
            const isSelected = loc.id === currentLocation.id;

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onSelect(loc);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d2822] border-[1.5px] border-[#00ffa3]/80'
                    : 'bg-[#14202c]/70 hover:bg-[#182736] border border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#1c2c3d] flex items-center justify-center text-slate-300 shrink-0">
                    <MapPin className="w-4 h-4 text-[#38bdf8]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-bold text-white truncate">
                        {loc.name}
                      </span>
                      {loc.stationCode && (
                        <span className="bg-[#0b3832] text-[#00ffa3] text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {loc.stationCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 mt-0.5">
                      <Shield className="w-3 h-3 text-[#00ffa3]" />
                      <span>{loc.gateOrExit ? `Via ${loc.gateOrExit}` : 'Sheltered Connection'}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#00ffa3] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

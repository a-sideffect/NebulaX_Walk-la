import React, { useState } from 'react';
import { X, User, Bell, Shield, Sparkles, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'limy0364@e.ntu.edu.sg',
}) => {
  const [prefer100Dry, setPrefer100Dry] = useState(true);
  const [avoidCrossings, setAvoidCrossings] = useState(true);
  const [rainAlerts, setRainAlerts] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#101822] rounded-t-[28px] sm:rounded-[28px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        id="profile-modal"
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-[16px] font-bold text-white tracking-tight">
            Commuter Profile & Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* User info card */}
          <div className="bg-[#14202d] rounded-2xl border border-slate-700/60 p-3.5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00ffa3] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-[15px] truncate">
                  NTU Commuter
                </span>
                <span className="bg-[#0b3832] text-[#00ffa3] text-[9.5px] font-extrabold px-2 py-0.5 rounded-full">
                  PRO CANOPY
                </span>
              </div>
              <p className="text-[12px] text-slate-400 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Shelter Routing Preferences
            </span>

            <div className="bg-[#121c27] rounded-2xl border border-slate-800/80 p-3.5 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#00ffa3]" />
                  <span className="text-[13.5px] font-medium text-slate-200">
                    Prioritize 100% Dry Routes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={prefer100Dry}
                  onChange={(e) => setPrefer100Dry(e.target.checked)}
                  className="w-4 h-4 accent-[#00ffa3] rounded cursor-pointer"
                />
              </label>

              <div className="h-[1px] bg-slate-800" />

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-[13.5px] font-medium text-slate-200">
                    Avoid Uncovered Crossings
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={avoidCrossings}
                  onChange={(e) => setAvoidCrossings(e.target.checked)}
                  className="w-4 h-4 accent-[#00ffa3] rounded cursor-pointer"
                />
              </label>

              <div className="h-[1px] bg-slate-800" />

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-[#fba268]" />
                  <span className="text-[13.5px] font-medium text-slate-200">
                    Rain Alarm (10-min warning)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rainAlerts}
                  onChange={(e) => setRainAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#00ffa3] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#00ffa3] text-[#023122] font-bold text-[14.5px] hover:bg-[#00e895] transition-colors cursor-pointer mt-2"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { ReduceMotionMode, SettingsState } from "../hooks/useSettings";

type Props = {
  settings: SettingsState;
};

const MOTION_OPTIONS: { value: ReduceMotionMode; label: string }[] = [
  { value: "auto", label: "Auto (OS)" },
  { value: "off", label: "Full motion" },
  { value: "on", label: "Reduced" },
];

export function SettingsMenu({ settings }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open settings"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-white/70 hover:bg-white border border-coffee-200 flex items-center justify-center text-coffee-700 transition-colors focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:outline-none"
      >
        <Icon icon="solar:settings-linear" className="text-base" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-coffee-100">
            <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wide">
              Preferences
            </p>
            <p className="mt-1 text-xs text-coffee-800 font-light">
              Saved to this browser.
            </p>
          </div>

          <Toggle
            icon="solar:bell-linear"
            label="Sound effects"
            description="Soft bell on tx success."
            checked={settings.soundEnabled}
            onChange={settings.setSoundEnabled}
          />
          <Toggle
            icon="solar:cup-hot-linear"
            label="Ambient cafe"
            description="Low-fi noise loop."
            checked={settings.ambientEnabled}
            onChange={settings.setAmbientEnabled}
          />
          <Toggle
            icon="solar:ghost-linear"
            label="Demo mode"
            description="Simulated transactions every 5s."
            checked={settings.demoMode}
            onChange={settings.setDemoMode}
          />

          <div className="px-4 py-3 border-t border-coffee-100">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-coffee-50 border border-coffee-100 flex items-center justify-center shrink-0">
                <Icon
                  icon="solar:leaf-linear"
                  className="text-base text-coffee-700"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-coffee-950">
                  Motion
                </p>
                <p className="text-[10px] text-coffee-600 font-light">
                  Pulses, steam, confetti.
                </p>
                <div className="mt-2 flex gap-1 rounded-full bg-coffee-50 border border-coffee-100 p-0.5">
                  {MOTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        settings.setReduceMotionOverride(opt.value)
                      }
                      className={`flex-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:outline-none ${
                        settings.reduceMotionOverride === opt.value
                          ? "bg-white text-coffee-950 shadow-sm"
                          : "text-coffee-500 hover:text-coffee-800"
                      }`}
                      aria-pressed={
                        settings.reduceMotionOverride === opt.value
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ToggleProps = {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

function Toggle({ icon, label, description, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-coffee-50 transition-colors text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coffee-500 focus-visible:outline-none"
    >
      <div className="w-7 h-7 rounded-lg bg-coffee-50 border border-coffee-100 flex items-center justify-center shrink-0">
        <Icon icon={icon} className="text-base text-coffee-700" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-coffee-950">{label}</p>
        <p className="text-[10px] text-coffee-600 font-light">{description}</p>
      </div>
      <span
        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-coffee-700" : "bg-coffee-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

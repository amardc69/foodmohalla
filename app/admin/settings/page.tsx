"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ─── Sound preview helpers (Web Audio API) ───────────────────────────────── */
function playTing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

function playDong() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch { /* ignore */ }
}

export default function SettingsPage() {
  const adminSettings = useQuery(api.adminSettings.getAllSettings) || {};
  const soundPref = adminSettings.notificationSound;
  const setSettingMutation = useMutation(api.adminSettings.setSetting);

  const [selectedSound, setSelectedSound] = useState("ting");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (soundPref) {
      setSelectedSound(soundPref);
    }
  }, [soundPref]);

  async function handleSave() {
    await setSettingMutation({ key: "notificationSound", value: selectedSound });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePreview(sound: string) {
    if (sound === "dong") {
      playDong();
    } else {
      playTing();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
          System Settings
        </h2>
        <p className="text-text-muted mt-1">
          Configure app-wide preferences and notifications.
        </p>
      </div>

      {/* Notification Sound */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <div>
              <h3 className="font-bold text-text-main">New Order Notification Sound</h3>
              <p className="text-sm text-text-muted">Choose the sound that plays when a new order arrives</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            {
              id: "ting",
              label: "Ting",
              description: "A bright, high-pitched bell sound",
              icon: "music_note",
              color: "from-blue-500 to-cyan-500",
            },
            {
              id: "dong",
              label: "Dong",
              description: "A deep, resonant bell sound",
              icon: "doorbell",
              color: "from-purple-500 to-indigo-500",
            },
          ].map((sound) => (
            <div
              key={sound.id}
              onClick={() => setSelectedSound(sound.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedSound === sound.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-primary/40"
              }`}
            >
              <div className={`p-3 bg-gradient-to-br ${sound.color} rounded-xl text-white shadow-sm`}>
                <span className="material-symbols-outlined">{sound.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-text-main">{sound.label}</h4>
                <p className="text-sm text-text-muted">{sound.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(sound.id);
                }}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                title="Preview sound"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              </button>
              {selectedSound === sound.id && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                Saved!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Additional settings can be added here */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <h3 className="font-bold text-text-main">More Settings</h3>
            <p className="text-sm text-text-muted">Additional settings will be available soon</p>
          </div>
        </div>
        <div className="space-y-3 opacity-40 pointer-events-none">
          <div className="h-12 bg-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

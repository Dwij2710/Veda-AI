'use client';

import { useState } from 'react';
import type { AppSettings } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: Props) {
  const [apiKey, setApiKey] = useState(
    settings.groqApiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
  );
  const [enhanceContrast, setEnhanceContrast] = useState(settings.enhanceContrast);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...settings,
      groqApiKey: apiKey.trim(),
      enhanceContrast
    });
    onClose();
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim() || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage('Testing Groq connection...');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${keyToTest}`
        }
      });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Groq API Key is valid and connected!');
      } else {
        const data = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(data.error?.message || 'Invalid API key or network error.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Failed to reach Groq API.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">AI &amp; Model Settings</h2>
              <p className="text-xs text-gray-400">Groq API &amp; OCR pre-processing configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Groq API Key
              </label>
              {apiKey.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="gsk_..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 font-sans"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Auto-loaded from .env.local</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-orange-500 hover:underline font-medium"
              >
                console.groq.com ↗
              </a>
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-800">Enhance Pencil / Handwriting Contrast</p>
                <p className="text-[11px] text-gray-400">Boosts faint strokes on mobile phone scans</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={enhanceContrast}
                  onChange={(e) => setEnhanceContrast(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </div>

          {testStatus !== 'idle' && (
            <div
              className={`rounded-xl p-3 text-xs ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
            >
              {testMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="text-xs font-medium text-gray-600 hover:text-orange-600 transition"
            >
              {testStatus === 'testing' ? 'Testing...' : '⚡ Test Connection'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-gray-900 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-gray-800 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

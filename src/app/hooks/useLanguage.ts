import { useSyncExternalStore } from 'react';

export type Language = 'English' | 'Tamil';

const STORAGE_KEY = 'selectedLanguage';
const EVENT_NAME = 'languagechange';

function getSnapshot(): Language {
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'English';
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Update the app language and notify all subscribers (cross-component sync). */
export function setLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new Event(EVENT_NAME));
}

/**
 * Shared language state backed by localStorage. Any component using this hook
 * re-renders when the language changes anywhere in the app (e.g. from the TopBar).
 */
export function useLanguage(): [Language, (lang: Language) => void] {
  const language = useSyncExternalStore(subscribe, getSnapshot, () => 'English' as Language);
  return [language, setLanguage];
}

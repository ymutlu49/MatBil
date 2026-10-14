import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const voice = (name, lang, localService = true) => ({ name, lang, localService, default: false });

// Chrome masaüstünde Türkçe sesin olmadığı tipik liste: ilk Google sesi "Deutsch"
const CHROME_NO_TR = [voice('Google Deutsch', 'de-DE', false), voice('Google US English', 'en-US', false)];

let spoken;
const installSynth = (voices) => {
  spoken = [];
  window.speechSynthesis = {
    getVoices: () => voices,
    speak: (u) => spoken.push(u),
    cancel: vi.fn(),
    resume: vi.fn(),
    paused: false,
    addEventListener: vi.fn(),
  };
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
};

const loadSpeech = async () => {
  vi.resetModules();
  return import('./speech');
};

describe('speech — Türkçe ses seçimi', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it('Türkçe sesi açıkça seçer (lang ataması tek başına yetmez)', async () => {
    installSynth([...CHROME_NO_TR, voice('Microsoft Tolga - Turkish (Turkey)', 'tr-TR')]);
    const { speak } = await loadSpeech();
    speak('on iki');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice.name).toMatch(/Tolga/);
    expect(spoken[0].lang).toBe('tr-TR');
  });

  it('birden çok Türkçe ses varsa doğal (natural) sesi tercih eder', async () => {
    installSynth([
      voice('Microsoft Tolga - Turkish (Turkey)', 'tr-TR'),
      voice('Microsoft Emel Online (Natural) - Turkish (Turkey)', 'tr-TR', false),
    ]);
    const { speak } = await loadSpeech();
    speak('merhaba');
    expect(spoken[0].voice.name).toMatch(/Emel/);
  });

  it('Android Chrome tarzı "tr_TR" etiketini de Türkçe sayar', async () => {
    installSynth([voice('Türkçe Türkiye', 'tr_TR')]);
    const { speak } = await loadSpeech();
    speak('beş');
    expect(spoken[0].voice.name).toBe('Türkçe Türkiye');
    expect(spoken[0].lang).toBe('tr-TR');
  });

  it('Türkçe ses yoksa Almanca/İngilizce sesle OKUMAZ ve uyarı yayar', async () => {
    installSynth(CHROME_NO_TR);
    const { speak, TTS_UNAVAILABLE_EVENT } = await loadSpeech();
    const onUnavailable = vi.fn();
    window.addEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
    const onEnd = vi.fn();
    speak('on iki', { explicit: true, onEnd });
    window.removeEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
    expect(spoken).toHaveLength(0);
    expect(onUnavailable).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('otomatik okumalarda uyarıyı yalnızca bir kez yayar', async () => {
    installSynth(CHROME_NO_TR);
    const { speak, TTS_UNAVAILABLE_EVENT } = await loadSpeech();
    const onUnavailable = vi.fn();
    window.addEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
    speak('1'); speak('2'); speak('3');
    window.removeEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });
});

describe('speakNumber — Ses Açık/Kapalı ayarı', () => {
  afterEach(() => {
    localStorage.clear();
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it('ses kapalıyken sayı okumaz', async () => {
    installSynth([voice('Microsoft Tolga', 'tr-TR')]);
    localStorage.setItem('matbil_ses', 'false');
    vi.resetModules();
    const { speakNumber } = await import('./helpers');
    speakNumber(7);
    expect(spoken).toHaveLength(0);
  });

  it('ses açıkken sayıyı Türkçe sesle okur', async () => {
    installSynth([voice('Microsoft Tolga', 'tr-TR')]);
    vi.resetModules();
    const { speakNumber } = await import('./helpers');
    speakNumber(7);
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('7');
  });
});

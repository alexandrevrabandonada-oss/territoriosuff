import { useEffect, useId, useMemo, useState } from "react";

type TextToSpeechButtonProps = {
  label?: string;
  text: string;
  title?: string;
};

function normalizeSpeechText(text: string): string {
  return text
    .replace(/[#*_>`~-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function TextToSpeechButton({ label = "Ouvir conteúdo", text, title }: TextToSpeechButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const descriptionId = useId();

  const speechText = useMemo(() => {
    const normalized = normalizeSpeechText(text);
    return title ? `${title}. ${normalized}` : normalized;
  }, [text, title]);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
  }, []);

  useEffect(() => {
    if (!supported) return undefined;

    const syncState = () => {
      setSpeaking(window.speechSynthesis.speaking && !window.speechSynthesis.paused);
    };

    window.speechSynthesis.addEventListener("voiceschanged", syncState);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", syncState);
    };
  }, [supported]);

  if (!supported || !speechText) {
    return null;
  }

  const startSpeech = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="tts-control" role="group" aria-label="Leitura em voz alta">
      <p id={descriptionId} className="sr-only">
        Usa a síntese de voz do navegador para ler o resumo desta seção.
      </p>
      <button
        type="button"
        className="tts-button"
        aria-describedby={descriptionId}
        aria-pressed={speaking}
        onClick={speaking ? stopSpeech : startSpeech}
      >
        <span aria-hidden="true">{speaking ? "■" : "▶"}</span>
        {speaking ? "Parar leitura" : label}
      </button>
    </div>
  );
}

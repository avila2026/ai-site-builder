import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  phoneNumber = '5568999999999', // Placeholder: Substituir pelo número real do AVILA
  defaultMessage = 'Olá AVILA, gostaria de saber mais sobre as peças do catálogo!'
}) => {
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip simples */}
      <div className="mb-2 hidden md:block bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-fade-in">
        Precisa de ajuda? Chame no Zap!
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
        aria-label="Conversar no WhatsApp"
      >
        {/* Efeito de Pulse Industrial */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40"></span>

        <MessageCircle
          className="relative z-10 w-8 h-8 text-white"
          strokeWidth={2.5}
        />

        {/* Glow suave ao redor */}
        <div className="absolute inset-0 rounded-full ring-4 ring-[#25D366] ring-opacity-20 group-hover:ring-opacity-50 transition-all"></div>
      </a>
    </div>
  );
};

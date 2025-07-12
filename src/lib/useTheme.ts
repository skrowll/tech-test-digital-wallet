'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Função para detectar o tema atual
    const detectTheme = (): Theme => {
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }
      return 'light';
    };

    // Detectar tema inicial
    setTheme(detectTheme());

    // Observer para detectar mudanças na classe 'dark' do documento
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setTheme(detectTheme());
        }
      });
    });

    // Observar mudanças na classe do documentElement
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

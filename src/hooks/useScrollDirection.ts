"use client";

import { useState, useEffect } from "react";

interface UseScrollDirectionOptions {
  // Quand true, le header est toujours dans l'état "scrollé" (opaque)
  forceScrolled?: boolean;
}

export function useScrollDirection({ forceScrolled = false }: UseScrollDirectionOptions = {}) {
  const [scrolled, setScrolled] = useState(forceScrolled);

  useEffect(() => {
    // Si forcé, pas besoin d'écouter le scroll
    if (forceScrolled) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Vérification initiale au montage
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled]);

  return { scrolled };
}

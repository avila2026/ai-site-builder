/**
 * Componente para pré-carregar recursos críticos
 * Melhora LCP (Largest Contentful Paint) e FCP (First Contentful Paint)
 */

export function PreloadResources() {
  return (
    <>
      {/* Preconnect para domínios externos */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch para recursos externos */}
      <link rel="dns-prefetch" href="https://vercel.com" />
      <link rel="dns-prefetch" href="https://nextjs.org" />

      {/* Preload de fontes críticas */}
      <link
        rel="preload"
        href="/fonts/geist-sans.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}

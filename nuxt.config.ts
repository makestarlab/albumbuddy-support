import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'AlbumBuddy Support',
      htmlAttrs: { lang: 'ko' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AlbumBuddy 고객센터' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // 외부 이미지 호스트 미리 연결 (DNS+TLS 핸드셰이크 사전 처리 → hero-bg LCP 단축)
        {
          rel: 'preconnect',
          href: 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com',
          crossorigin: '',
        },
        {
          rel: 'dns-prefetch',
          href: 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com',
        },
        {
          rel: 'preconnect',
          href: 'https://rgdtezwgbngfpihvgnta.supabase.co',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
          crossorigin: '',
        },
      ],
    },
  },

  modules: ['@nuxtjs/supabase', '@nuxt/image'],

  css: ['~/assets/css/app.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  supabase: {
    redirect: false,
  },

  image: {
    // 로컬 dev: sharp 빌드 없이도 동작하도록 'none' (원본 URL 그대로)
    // Vercel 배포 시 Vercel Image Optimization API가 자동 사용됨
    provider: 'none',
    quality: 80,
    format: ['avif', 'webp'],
    screens: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    domains: [
      'warwiqpssw4f1yzy.public.blob.vercel-storage.com', // 마케팅용 Vercel Blob
      'rgdtezwgbngfpihvgnta.supabase.co', // 공지 본문 이미지 (Supabase Storage)
    ],
  },
});

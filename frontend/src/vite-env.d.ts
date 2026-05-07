/// <reference types="vite/client" />

// figma:asset/* virtual imports resolved by vite.config.ts figmaAssetResolver
declare module 'figma:asset/*' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_USE_MOBILE_FRAME: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

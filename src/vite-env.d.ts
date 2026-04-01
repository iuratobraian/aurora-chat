/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_CONVEX_URL: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_MERCADOPAGO_PUBLIC_KEY: string
  readonly MODE: 'development' | 'production' | 'staging'
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const process: {
  env: {
    [key: string]: string | undefined
  }
}

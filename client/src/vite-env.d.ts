/// <reference types="vite/client" />

interface ImportMetaEnv {
  // base URL of the public media bucket (S3) — set in the root .env
  readonly VITE_MEDIA_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

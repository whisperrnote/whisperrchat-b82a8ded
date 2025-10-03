/// <reference types="vite/client" />

// Web3 Types
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
  };
}

// Environment Variables
interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_WEB3_FUNCTION_ID: string;
  readonly VITE_DATABASE_MAIN: string;
  readonly VITE_DATABASE_SOCIAL: string;
  readonly VITE_DATABASE_WEB3: string;
  readonly VITE_DATABASE_CONTENT: string;
  readonly VITE_DATABASE_ANALYTICS: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


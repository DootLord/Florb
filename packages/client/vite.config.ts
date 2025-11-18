import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {

  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET;
  const isDevServer = command === 'serve';

  if (isDevServer && !apiTarget) {
    throw new Error('VITE_API_TARGET is not defined in the environment variables for development mode.');
  }

  console.log(`Vite is running in ${mode} mode. API target is ${apiTarget}. Is dev server: ${isDevServer}`);

  let serverConfig = undefined;
  if (isDevServer) {
    serverConfig = {
      host: true, // Listens on 0.0.0.0. Important for docker!
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }

  //!! Note to self, in prod nothing is being handled by vite!!! So this proxy is only for dev!
  return {
    plugins: [react()],
    server: serverConfig,
    build: {
      outDir: 'dist',
    }
  }
})

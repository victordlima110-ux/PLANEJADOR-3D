import { defineConfig, devices } from '@playwright/test';

// Os testes rodam contra o site compilado de verdade. Cada teste começa com um
// navegador limpo: o programa não tem login nem serviço externo.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  globalTimeout: process.env.CI ? 12 * 60_000 : undefined,
  maxFailures: process.env.CI ? 5 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4188',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    // O formato de celular tem layout próprio, então vale ser testado também.
    {
      name: 'celular',
      use: {
        ...devices['Pixel 7'],
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4188 --host 127.0.0.1 --strictPort',
    url: 'http://127.0.0.1:4188',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

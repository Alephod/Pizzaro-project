// frontend/jest.config.ts
import nextJest from 'next/jest.js' // С .js для ESM mode (package.json "type": "module")

import type { Config } from 'jest'

const createNextJestConfig = nextJest({
  // Путь к Next.js приложению (загружает next.config.js и .env)
  dir: './',
})

const customConfig: Config = {
  // Окружение браузера для React-компонентов
  testEnvironment: 'jsdom',

  // Поддержка SCSS/CSS-модулей (identity-obj-proxy для мокинга стилей). Убедись, что пакет установлен: npm i -D identity-obj-proxy
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Абсолютные импорты (синхронизируй с tsconfig.json paths, если там "^@/*": ["./src/*"])
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Расширения файлов
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Файл с глобальными настройками (jest-dom matchers). Создай src/setupTests.ts с import '@testing-library/jest-dom';
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Сбор покрытия (обновлено: добавь репортеры для CI)
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/generated/**',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'], // Для GitHub Actions/Vercel CI

  // Для ESM и React 19 совместимости (нужно для избежания ошибок с модулями)
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Паттерн для поиска тестов (colocated, как Button.test.tsx)
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],

  // Игнор трансформа для ESM-модулей (фикс для ошибок "Unexpected token 'export'" в node_modules, особенно @testing-library)
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|react-dom|react)/)',
  ],
}

export default createNextJestConfig(customConfig)
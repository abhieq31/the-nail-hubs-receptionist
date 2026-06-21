import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Vendored MediaPipe runtime, build output, and generated coverage reports
    ignores: ['public/mediapipe/**', '.next/**', 'coverage/**'],
  },
  ...compat.extends('next/core-web-vitals'),
];

export default eslintConfig;

import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript';
import alias from '@rollup/plugin-alias';
import path from 'path';

const projectRootDir = path.resolve(__dirname);
const entries = [
  { find: '@/lib', replacement: path.resolve(projectRootDir, 'src/lib') },
  {
    find: '@/interfaces',
    replacement: path.resolve(projectRootDir, 'src/interfaces')
  },
  { find: '@/models', replacement: path.resolve(projectRootDir, 'src/models') }
];

export default [
  {
    input: 'src/pkg.ts',
    output: [
      {
        file: 'build/index.js',
        format: 'cjs',
        exports: 'named'
      }
    ],
    plugins: [
      alias({
        entries
      }),
      typescript({ tsconfig: 'tsconfig.pkg.json' })
    ]
  },
  {
    input: 'src/types.ts',
    output: [{ file: 'build/index.d.ts', format: 'es' }],
    plugins: [
      alias({
        entries
      }),
      dts()
    ]
  }
];

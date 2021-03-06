import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
export default {
    input: 'src/client/main.ts',
    output: {
        file: 'build/bionicle.min.js',
    },
    plugins: [
        commonjs(),
        typescript({
            tsconfig: './config/tsconfig-client.json',
        }),
        terser(),
    ],
}
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
export default {
    input: 'src/server/main.ts',
    output: {
        file: 'build/server.js',
    },
    plugins: [
        commonjs(),
        typescript({
            tsconfig: './config/tsconfig-server.json',
        }),
    ],
}
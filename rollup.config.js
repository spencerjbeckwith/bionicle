import typescript from '@rollup/plugin-typescript';
export default {
    input: 'src/main.ts',
    output: {
        file: 'build/main.js',
    },
    plugins: [
        typescript({
            tsconfig: 'tsconfig.json',
        }),
    ],
}
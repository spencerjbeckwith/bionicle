import typescript from '@rollup/plugin-typescript';
export default {
    input: 'src/client/main.ts',
    output: {
        file: 'build/client.js',
    },
    plugins: [
        typescript({
            tsconfig: './config/tsconfig-client.json',
        }),
    ],
}
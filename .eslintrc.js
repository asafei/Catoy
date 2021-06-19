/** @format */

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        // 'prettier/@typescript-eslint',// 应合并到prettier了
        'plugin:prettier/recommended',
        'prettier',
    ],
    env: {
        //指定代码的运行环境
        browser: true,
        node: true,
    },
    rules:{
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off'
        
    }
}

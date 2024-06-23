// @ts-check
import eslint from '@eslint/js'
// ts-eslint解析器，使 eslint 可以解析 ts 语法
import tseslint from 'typescript-eslint'
export default tseslint.config({
  // tseslint.config添加了extends扁平函数，直接用。否则是eslint9.0版本是没有extends的
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic
  ],
  rules: {
    'semi': ['warn', 'never'],
    "comma-dangle": ["error", "never"],
    "@typescript-eslint/no-unused-vars": 'off',
    "@typescript-eslint/no-extraneous-class": 'off',
    'space-before-function-paren': 0,
    'generator-star-spacing': 'off',
    'object-curly-spacing': 0, // 强制在大括号中使用一致的空格
    'array-bracket-spacing': 0 // 方括号
  }
})

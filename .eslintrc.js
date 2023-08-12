console.log(
  '\x1B[0;37;44m INFO \x1B[0m',
  '\x1B[0;;34m ' +
    `读取了: ${__filename.slice(__dirname.length + 1)}` +
    ' \x1B[0m'
);

module.exports = {
  root: true, // http://eslint.cn/docs/user-guide/configuring#using-configuration-files-1
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended', // prettierrc配置文件声明了singleQuote:true,即单引号，printWidth：80，即一行80，且prettier默认一个缩进四个空格
  ],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:prettier/recommended', // prettierrc配置文件声明了singleQuote:true,即单引号，printWidth：80，即一行80，且prettier默认一个缩进四个空格
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      plugins: ['@typescript-eslint', 'import'],
      rules: {
        camelcase: 0, // 强制执行驼峰命名约定
        'no-shadow': 0, // 禁止变量声明与外层作用域的变量同名
        'no-console': 0, // 此规则不允许调用console对象的方法。
        'class-methods-use-this': 0, // 类方法如果不使用this的话会报错
        'global-require': 0, // 此规则要求所有调用require()都在模块的顶层，此规则在 ESLint v7.0.0中已弃用。请使用 中的相应规则eslint-plugin-node：https://github.com/mysticatea/eslint-plugin-node
        'no-unused-vars': 0, // 禁止出现未使用过的变量
        'no-use-before-define': 0,

        'no-underscore-dangle': 1, // 此规则不允许在标识符中使用悬空下划线。

        'no-var': 2, // 要求let或const代替var
        'no-param-reassign': 2, // 禁止对 function 的参数进行重新赋值
        'no-nested-ternary': 2, // 禁止嵌套三元
        'no-plusplus': 2, // 禁用一元操作符 ++ 和 --
        'vars-on-top': 2, // 要求所有的 var 声明出现在它们所在的作用域顶部
        'prefer-const': 2, // 要求使用 const 声明那些声明后不再被修改的变量
        'prefer-template': 2, // 要求使用模板字符串代替字符串连接
        'new-cap': 2, // 要求构造函数名称以大写字母开头
        'no-iterator': 2, // 禁止使用__iterator__迭代器
        'require-await': 2, // 禁止使用不带 await 表达式的 async 函数
        'no-empty': 2, // 禁止空块语句
        'guard-for-in': 2, // 要求for-in循环包含if语句
        'no-unused-expressions': [
          2,
          {
            allowShortCircuit: true, // 允许短路，即允许a() && b();
            allowTernary: true, // 允许三元
          },
        ], // 禁止未使用的表达式
        'no-restricted-syntax': [
          2,
          // 'ForInStatement',
          // 'ForOfStatement',
          {
            selector: 'ForInStatement',
            /**
             * 用 map() / every() / filter() / find() / findIndex() / reduce() / some() / ... 遍历数组，
             * 和使用 Object.keys() / Object.values() / Object.entries() 迭代你的对象生成数组。
             * 拥有返回值得纯函数比这个更容易解释
             */
            message:
              'for in会迭代遍历原型链(__proto__)，建议使用map/every/filter等遍历数组，使用Object.{keys,values,entries}等遍历对象',
          },
          {
            selector: 'ForOfStatement',
            message:
              '建议使用map/every/filter等遍历数组，使用Object.{keys,values,entries}等遍历对象',
          },
        ], // 禁用一些语法https://github.com/BingKui/javascript-zh#%E8%BF%AD%E4%BB%A3%E5%99%A8%E5%92%8C%E5%8F%91%E7%94%9F%E5%99%A8

        'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }], // 该规则强制注释中 // 或 /* 后空格的一致性
        'object-shorthand': ['error', 'always'], // （默认）希望尽可能使用速记。var foo = {x:x};替换为var foo = {x};

        // eslint-plugin-import插件
        // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
        'import/order': [
          'error',
          {
            groups: [
              'builtin', // 如:import fs from 'fs';
              'external', // 如:import _ from 'lodash';
              'internal', // 如:import foo from 'src/foo';
              'parent', // 如:import foo from '../foo';
              'sibling', // 如:import bar from './bar';
              // ['sibling', 'parent'],
              // ['parent', 'sibling'],
              'index', // 如:import main from './';
              'object', // 如:import log = console.log;
              'type', // 如:import type { Foo } from 'foo';
            ],
            pathGroups: [
              {
                pattern: '@/**',
                group: 'internal',
              },
            ],
            'newlines-between': 'always', // 强制或禁止导入组之间的新行
            // 根据导入路径以字母顺序排列每个组中的顺序
            alphabetize: {
              order: 'asc', // 使用asc按升序排序，使用desc按降序排序（默认值：ignore）。
              caseInsensitive: false, // 使用true忽略大小写，而false考虑大小写（默认值：false）。
              orderImportKind: 'asc', // 使用asc以升序对各种导入类型进行排序，例如以type或typeof为前缀的导入，具有相同的导入路径。使用desc按降序排序（默认值：忽略）
            },
          },
        ],
        'import/newline-after-import': 2, // 强制在最后一个顶级导入语句或 require 调用之后有一个或多个空行
        'import/no-extraneous-dependencies': 2, // 禁止导入未在package.json中声明的外部模块。
        /**
         * import/named
         * 在import { version } from 'vuex';的时候会验证vuex有没有具名导出version，
         * 但是在vue3的时候，import { defineComponent } from 'vue';会报错defineComponent not found in 'vue'
         * 因此vue3项目关闭该规则
         */
        'import/named': 0,
        /**
         * a.js
         * export const version = '1.0.0';
         * export const bar = { name: 'bar', version };
         * export default bar;
         * b.js
         * import bar from './a';
         * console.log(bar.version); // 检测到你使用的version有具名导出，import/no-named-as-default-member就会提示`import {version} from './a'`
         */
        'import/no-named-as-default-member': 1, // https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default-member.md
        'import/prefer-default-export': 0, // 当模块只有一个导出时，更喜欢使用默认导出而不是命名导出。
        'import/extensions': 0, // 确保在导入路径中一致使用文件扩展名。在js/ts等文件里引其他文件都不能带后缀（比如.css和.jpg），因此关掉
        'import/no-unresolved': 0, // 不能解析带别名的路径的模块，但实际上是不影响代码运行的。找不到解决办法，暂时关掉。
        /**
         * a.js
         * export const bar = 'bar';
         * export const foo = 'foo';
         * export default foo;
         * b.js
         * import bar from './a'; // import/no-named-as-default规则会报错，因为import/no-named-as-default规则误以为你将具名导出的bar作为了默认导出来使用，但是实际上可能我就是想用默认导出的foo
         * // import barr from './a'; // 改个名字import/no-named-as-default规则就不会报错了。
         * // 不幸的是，React + Redux 是最常见的场景。但是，还有很多其他情况，HOC 会迫使开发人员关闭此规则。https://github.com/import-js/eslint-plugin-import/issues/544#issuecomment-245082471
         */
        'import/no-named-as-default': 0, // https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default.md
        'import/no-dynamic-require': 0, // 禁止使用动态的require，如：require(`../${name}`)

        // @typescript-eslint插件
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowBoolean: true,
            allowNumber: true,
          },
        ], // 强制模板文字表达式为string类型。即const a = {};console.log(`${a}`);会报错
        '@typescript-eslint/no-use-before-define': 2, // 此规则扩展了基本eslint/no-use-before-define规则。它增加了对type,interface和enum声明的支持。
        '@typescript-eslint/no-unused-vars': 2, // 禁止出现未使用过的变量
        '@typescript-eslint/no-shadow': 2, // 禁止变量声明与外层作用域的变量同名
        '@typescript-eslint/no-explicit-any': 0, // 不允许any定义类型。
        '@typescript-eslint/ban-ts-comment': 0, // 禁止@ts-<directive>评论或要求指令后的描述。
        '@typescript-eslint/no-unsafe-return': 0, // 不允许从函数返回具有类型的值any。
        '@typescript-eslint/no-unsafe-argument': 0, // 不允许使用类型为any的值调用函数。
        '@typescript-eslint/no-unsafe-assignment': 0, // 不允许将具有类型的值分配any给变量和属性。
        '@typescript-eslint/no-unsafe-member-access': 0, // 不允许对类型为any的值进行成员访问
        '@typescript-eslint/no-unsafe-call': 0, // 不允许调用任何类型为any的变量。
        '@typescript-eslint/unbound-method': 0, // 强制未绑定的方法在其预期范围内调用。
        '@typescript-eslint/no-floating-promises': 0, // 要求适当处理类似 Promise 的语句。
        '@typescript-eslint/no-var-requires': 0, // 除 import 语句外，禁止require语句。https://typescript-eslint.io/rules/no-var-requires/
        '@typescript-eslint/no-non-null-assertion': 0, // 禁止使用后缀运算符!的非空断言。
      },
    },
  ],
};

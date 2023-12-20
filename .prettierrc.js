module.exports = {
  // 行末分号
  semi: true,
  // 使用单引号
  singleQuote: false,
  // 行尾换行格式
  endOfLine: "auto",
  // 最大长度80个字符(包括JSX部分)
  printWidth: 180,
  // JSX双引号
  jsxSingleQuote: false,
  // 行尾逗号,默认none,可选 none|es5|all
  // es5 包括es5中的数组、对象
  // all 包括函数对象等所有可选
  trailingComma: "es5",
  // 在对象文字中的空格, true: { foo: bar }, false: {foo: bar}
  bracketSpacing: true,
  // JSX标签闭合位置 默认false
  // false: <div
  //          className=""
  //          style={{}}
  //       >
  // true: <div
  //          className=""
  //          style={{}} >
  jsxBracketSameLine: false,
  // 箭头函数参数括号 默认avoid 可选 avoid| always
  // avoid 能省略括号的时候就省略 例如x => x
  // always 总是有括号
  arrowParens: "always",
  // 在文件顶部插入一个特殊的 @format 标记，指定文件格式需要被格式化。
  insertPragma: false,
  // 缩进4字符
  tabWidth: 4,
  // 是否使用tab缩进
  useTabs: false,
  HTMLWhitespaceSensitivity: "strict",
};

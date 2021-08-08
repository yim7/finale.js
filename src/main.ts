import { Tokenizer, Parser, glEval } from "./gl";


const __main = function () {
  let code = `
    var name = "gua"
    var n = -1 + 2 * 3 -7
    const plus = function(n) {
      return n + 1
    }
    plus(1)
    `
  let tokenizer = new Tokenizer(code)

  let parser = new Parser(tokenizer.tokenize())
  let ast = parser.parse()
  console.log('-------ast', ast)

  let env = {}
  glEval(ast, env)
  console.log('-------env', env)
}

__main()
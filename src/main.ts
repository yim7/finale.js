import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { Tokenizer, Parser, glEval } from "./gl";

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}
const init_editor = function () {
  console.log('-------init editor')
  let container = document.getElementById("editor")
  container!.innerHTML = ''
  monaco.editor.create(container!, {
    value: "function hello() {\n\talert('Hello world!');\n}",
    language: "javascript"
  });
}

const __main = function () {
  init_editor()
  let code = `
    var name = "gua"
    var n = -1 + 2 * 3 -7
    const plus = function(n) {
      return n + 1
    }

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
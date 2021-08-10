import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { Tokenizer, Parser, glEval, Env } from "./gl";

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const init_editor = function () {
  // console.log('-------init editor')
  let container = document.getElementById("editor")
  container!.innerHTML = ''
  let editor = monaco.editor.create(container!, {
    value: `

const closure = function() {
  var n = 0
  return function() {
    log('n', n)
    n = 1
  }
}
const __main = function(){
  var f = closure()
  f()
}
// const plus = function (n) {
//   return n + 1
// }

// const __main = function () {
//   var a = 1 + 2 * 3 + 8 / 2
//   log('a', a)

//   var list = [1, 2, 3, 4]
//   log('list', list)
//   list.push(5, 6, 7)
//   list[1] = 9
//   log('list', list)
  
//   const e = function (s) {
//     return document.querySelector(s)
//   }
  
//   const es = function (s) {
//     return document.querySelectorAll(s)
//   }

//   var console = e('#console')
//   log('select', console)
//   console.style.color = 'red'
//   console.value = 'hello, gua'

//   var o = {a:'1', b: 3}
//   log('obj', o, o['b'])
// }
  
  __main()
  
`,
    language: "javascript"
  })

  editor.addAction({
    // An unique identifier of the contributed action.
    id: 'run-gl',

    // A label of the action that will be presented to the user.
    label: 'run-gl',

    // An optional array of keybindings for the action.
    keybindings: [
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R,
    ],

    contextMenuGroupId: 'navigation',

    contextMenuOrder: 1.5,

    // Method that will be executed when the action is triggered.
    // @param editor The editor instance is passed in as a convinience
    run: (ed) => {
      let code = editor.getModel()?.getValue()!
      let tokenizer = new Tokenizer(code)

      let parser = new Parser(tokenizer.tokenize())
      let ast = parser.parse()
      console.log('-------ast', ast)

      let env = new Env()
      glEval(ast, env)
      // console.log('-------finally env', env)
    }
  })

  return editor
}


const __main = function () {
  init_editor()
}

__main()
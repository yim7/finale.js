import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { glEval } from "./gl";
import { infer } from "./infer";
import { format } from "./format";

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
var n = 1

con plus = function(n) {return n + 1}
con plusN=function(n){
con inner=function(x){
log(n,'+',x)
return x + n
}
return inner
}
const plus2 = plusN(2,)
log(plus2(3,))
`
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
      // glEval(code)
      infer(code)
    }
  })
  editor.addAction({
    // An unique identifier of the contributed action.
    id: 'format-gl',

    // A label of the action that will be presented to the user.
    label: 'format',

    // An optional array of keybindings for the action.
    keybindings: [
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_L,
    ],

    contextMenuGroupId: 'navigation',

    contextMenuOrder: 1.5,

    // Method that will be executed when the action is triggered.
    // @param editor The editor instance is passed in as a convinience
    run: (ed) => {
      let code = editor.getModel()?.getValue()!
      // glEval(code)
      let formatted = format(code)
      console.log('-------format')
      console.log(formatted)
      editor.getModel()?.setValue(formatted)
    }
  })
  return editor
}


const __main = function () {
  init_editor()
}

__main()
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { glEval } from "./gl";
import { infer } from "./infer";
import { Formatter } from "./format";

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
  var array = [1,2,3,4,[7,7,7]]
  var o = {a: 1,b: {c: 2,d: 3,},}
    con f1 = function (a, b, c) {
return function () {log(a, b, c)}
  
  }
con f2 = function(n) {
      var grade1=8
      if (grade1<7) {log('小学生')} 
      else if (grade1 < 10){log('初中生')} 
      else{log('高中生')}
  }
  con demoString = function () {
      log('判断相等')
      log('good'=='good')
      log('good' != 'bad')
      log('very' + 'good')




  }
  
  
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
      try {
        let formatter = new Formatter(code)
        console.log('-------format')
        let output = formatter.format()
        console.log(output)
        editor.getModel()?.setValue(output)
      } catch (error) {
        console.log('-------format error', error)
      }


    }
  })
  return editor
}


const __main = function () {
  init_editor()
}

__main()
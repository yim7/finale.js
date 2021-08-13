import { AssignNode, Ast, BlockNode, CallNode, DeclareNode, FunctionNode, ModuleNode, NameNode, OperateNode, Parser, ReturnNode } from "./parser";
import { Tokenizer } from "./tokenizer";

class Line {
    indentLevel: number
    code: string

    constructor(code: string, indentLevel: number) {
        this.indentLevel = indentLevel
        this.code = code

    }
    toString() {
        let indent = ''
        for (let i = 0; i < this.indentLevel * 4; i++) {
            indent += ''
        }
        return indent + this.code
    }
}

type Lines = Line | Line[] | Lines[]
let indentLevel = 0

const indent = function (level) {
    let indent = ''
    for (let i = 0; i < level * 4; i++) {
        indent += ' '
    }

    return indent
}

class Formatter {
    code: string
    output: string = ''
    indentLevel: number = 0
    constructor(code: string) {
        this.code = code
    }

    write(s){
        this.output += s
    }
    _format(ast: Ast) {
        if (typeof ast == 'number') {
            let s = ast.toString()
            this.output

        }

        if (typeof ast == 'string') {
            return '\'' + ast + '\''
        }

        if (ast instanceof NameNode) {
            return ast.name
        }

        if (ast instanceof DeclareNode) {
            let name = ast.name
            let value = this._format(ast.value)
            let prefix = ast.isConst ? 'con' : 'var'
            let s = prefix + ' ' + name + ' = ' + value
            return s

        }

        if (ast instanceof ModuleNode) {
            let es: string[] = []
            for (const statement of ast.statements) {
                let line = this._format(statement)
                es.push(line)
            }
            return es.join('\n')
        }

        if (ast instanceof FunctionNode) {
            let args = ast.args.join(', ')
            let body = this._format(ast.body)
            let s = 'function (' + args + ') '
            // console.log('------------------------body', body);

            return s + body + '\n\n'
        }

        if (ast instanceof CallNode) {
            let args = ast.params.map(p => this._format(p)).join(', ')
            let call = this._format(ast.expr)
            let s = call + '(' + args + ')'
            return s
        }

        if (ast instanceof BlockNode) {
            indentLevel += 1
            let es: any = []
            let space = indent(indentLevel)
            // console.log('-------block indent', `<${space}>`)
            for (const e of ast.statements) {
                let s = space + this._format(e)
                es.push(s)
            }

            indentLevel -= 1
            return '{\n' + es.join('\n') + '\n' + indent(indentLevel) + '}'
        }

        if (ast instanceof ReturnNode) {
            let e = this._format(ast.expr)
            let s = 'return ' + e
            // console.log('-------return', s)
            return s
        }

        if (ast instanceof OperateNode) {
            let left = this._format(ast.left)
            let right = this._format(ast.right)
            let op = ast.op
            let s = left + op + right
            return s
        }

        console.log('-------Invalid Ast', ast)
        throw new Error("Invalid Ast")
    }
    format() {
        let tokenizer = new Tokenizer(this.code)
        let tokens = tokenizer.tokenize()
        let parser = new Parser(tokens)
        let ast = parser.parse()
        console.log('-------ast', ast)
        this._format(ast)

        return this.output
    }
}


export { format }
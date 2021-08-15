import { CompareNode, Ast, BlockNode, CallNode, DeclareNode, FunctionNode, ModuleNode, NameNode, OperateNode, Parser, ReturnNode, IfNode, AssignNode, MemberNode, IndexNode, ArrayNode, ObjectNode } from "./parser";
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

    write(s) {
        this.output += s
    }

    _format(ast: Ast) {
        console.log('-------ast type', typeof ast)
        if (typeof ast == 'number') {
            console.log('-------number', ast)
            let s = ast.toString()
            this.write(s)
            return
        }

        if (typeof ast == 'string') {
            let s = '\'' + ast + '\''
            this.write(s)
            return
        }

        if (ast instanceof ArrayNode) {
            this.write('[')
            for (const e of ast.elements) {
                this._format(e)
                this.write(', ')
            }
            this.write(']')
            return
        }

        if (ast instanceof ObjectNode) {
            this.write('{\n')
            indentLevel += 1
            let space = indent(indentLevel)
            for (const [k, v] of Object.entries(ast.obj)) {
                this.write(space)
                this.write(k)
                this.write(': ')
                this._format(v)
                this.write(',\n')
            }
            indentLevel -= 1
            this.write(indent(indentLevel))
            this.write('}')
            // indentLevel += 1
            // let space = indent(indentLevel)
            // for (const e of ast.statements) {
            //     this.write(space)
            //     this._format(e)
            //     this.write('\n')
            // }

            // indentLevel -= 1
            // this.write(indent(indentLevel))
            // this.write('}')
            
            return
        }

        if (ast instanceof NameNode) {
            let s = ast.name
            this.write(s)
            return
        }

        if (ast instanceof DeclareNode) {
            let name = ast.name

            let prefix = ast.isConst ? 'con' : 'var'
            let s = prefix + ' ' + name + ' = '
            this.write(s)
            this._format(ast.value)
            return
        }

        if (ast instanceof AssignNode) {
            let target = ast.target
            if (target instanceof NameNode) {
                this.write(target.name)
                this.write(' = ')
                this._format(ast.value)
            }
            return
        }

        if (ast instanceof MemberNode) {
            this._format(ast.object)
            this.write('.')
            this.write(ast.name)
            return
        }

        if (ast instanceof IndexNode) {
            this._format(ast.object)
            this.write('[')
            this._format(ast.index)
            this.write(']')
            return
        }

        if (ast instanceof ModuleNode) {
            for (const statement of ast.statements) {
                this._format(statement)
                this.write('\n')
            }
            return
        }

        if (ast instanceof FunctionNode) {
            let args = ast.args.join(', ')
            let s = 'function (' + args + ') '
            this.write(s)
            this._format(ast.body)
            this.write('\n')
            return
        }

        if (ast instanceof CallNode) {
            this._format(ast.expr)
            this.write('(')
            let params = ast.params
            for (let i = 0; i < params.length; i++) {
                const param = params[i]
                this._format(param)
                if (i != params.length - 1) {
                    this.write(', ')
                }

            }
            this.write(')')
            return
        }

        if (ast instanceof IfNode) {
            let [ifBranch, ...elseIfBranch] = ast.ifBranches

            this.write('if (')
            this._format(ifBranch.test)
            this.write(') ')
            this._format(ifBranch.block)

            for (const elseIf of elseIfBranch) {
                this.write(' else if (')
                this._format(elseIf.test)
                this.write(') ')
                this._format(elseIf.block)
            }

            if (ast.elseBlock) {
                this.write(' else ')
                this._format(ast.elseBlock)
            }
            return
        }

        if (ast instanceof BlockNode) {
            this.write('{\n')

            indentLevel += 1
            let space = indent(indentLevel)
            for (const e of ast.statements) {
                this.write(space)
                this._format(e)
                this.write('\n')
            }

            indentLevel -= 1
            this.write(indent(indentLevel))
            this.write('}')
            return
        }

        if (ast instanceof ReturnNode) {
            this.write('return ')
            this._format(ast.expr)
            return
        }

        if (ast instanceof OperateNode) {
            this._format(ast.left)
            this.write(' ' + ast.op + ' ')
            this._format(ast.right)
            return
        }

        if (ast instanceof CompareNode) {
            this._format(ast.left)
            this.write(' ' + ast.op + ' ')
            this._format(ast.right)
            return
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


export { Formatter }
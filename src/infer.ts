import { AssignNode, Ast, BlockNode, CallNode, DeclareNode, FunctionNode, ModuleNode, NameNode, OperateNode, Parser, ReturnNode } from "./parser";
import { Tokenizer } from "./tokenizer";

type GType = 'any' | 'number' | 'string' | 'boolean' | 'null' | FunctionType


class FunctionType {
    args: { [key: string]: GType[] }
    return: GType[]
    node: FunctionNode
    constructor(node: FunctionNode) {
        this.args = {}
        this.return = ['any']
        this.node = node
        for (const arg of node.args) {
            this.args[arg] = ['any']
        }
    }

    addArgType(name, type: GType) {
        let arg = this.args[name]
        if (arg[0] == 'any') {
            arg.pop()
        }
        arg.push(type)
    }

    addReturnType(type: GType) {
        let r = this.return
        if (r[0] == 'any') {
            r.pop()
        }
        r.push(type)
    }

    defbug() {
        let args = this.node.args.map(arg => this.args[arg])
            .map(arg => arg.join('|'))
            .join(', ')
        let returnType = this.return.join('|')
        return `(${args}) -> ${returnType}`
    }
}

class Env {
    state: { [key: string]: GType } = {}
    parent?: Env
    constructor(parent?: Env) {
        this.registerBuiltin()
        this.parent = parent
    }

    registerBuiltin() {
        this.state = {
        }
    }

    get(name: string) {
        let o: Env | undefined = this
        while (o !== undefined) {
            if (o.include(name)) {
                return o.state[name]
            } else {
                // console.log('-------find in parent', this.parent?.state)
                o = this.parent
            }
        }
        throw new Error("Variable not declared");
    }

    set(name: string, value: GType) {
        let o: Env | undefined = this
        while (o !== undefined) {
            if (o.include(name)) {
                o.state[name] = value
                return
            } else {
                // console.log('-------find in parent', this.parent?.state)
                o = this.parent
            }
        }
        throw new Error("Variable not declared");
    }

    declare(name: string, value: GType) {
        this.state[name] = value
    }

    include(name: string) {
        return this.state.hasOwnProperty(name)
    }

    debug() {
        // console.log('-------infer type')
        for (const [name, type] of Object.entries(this.state)) {
            if (type instanceof FunctionType) {
                console.log(name, ':', type.defbug());
            } else {
                console.log(name, ':', type)
            }
        }
    }

}

const _infer = function (ast: Ast, env: Env): GType {
    if (typeof ast == 'number') {
        // console.log('-------number type', ast)
        return 'number'
    }

    if (typeof ast == 'string') {
        // console.log('-------string type', ast)
        return 'string'
    }

    if (ast instanceof NameNode) {
        let t = env.get(ast.name)
        // console.log('-------variable type', ast.name, t)
        return t
    }

    if (ast instanceof DeclareNode) {
        let name = ast.name
        let value = _infer(ast.value, env) as GType
        env.declare(name, value)
        // console.log('-------declare', name, value)
        return 'null'
    }

    if (ast instanceof ModuleNode) {
        for (const statement of ast.statements) {
            _infer(statement, env)
        }
        return 'null'
    }

    if (ast instanceof FunctionNode) {
        let f = new FunctionType(ast)
        let args = ast.args

        let newEnv = new Env()
        for (let i = 0; i < args.length; i++) {
            let arg = args[i]
            newEnv.declare(arg, 'any')
        }
        let returnType = _infer(ast.body, newEnv)
        // console.log('-------func env', newEnv)
        for (let i = 0; i < args.length; i++) {
            let arg = args[i]
            let type = newEnv.get(arg)
            if (type != 'any') {
                f.addArgType(arg, type)
            }
        }
        f.addReturnType(returnType)
        return f
    }

    if (ast instanceof CallNode) {
        let f = _infer(ast.expr, env) as FunctionType
        let node = f.node
        let args = node.args
        let params = ast.params.map((p) => _infer(p, env))
        for (let i = 0; i < args.length; i++) {
            let arg = args[i]
            let param = params[i]
            f.addArgType(arg, param)
        }

        let newEnv = new Env()
        for (let i = 0; i < args.length; i++) {
            let arg = args[i]
            let param = params[i]
            newEnv.declare(arg, param)
        }
        let returnType = _infer(node.body, newEnv)
        f.addReturnType(returnType)

        return returnType
    }

    if (ast instanceof BlockNode) {
        let r = 'any' as GType
        for (const e of ast.statements) {
            r = _infer(e, env)
        }

        return r
    }

    if (ast instanceof ReturnNode) {
        return _infer(ast.expr, env)
    }

    if (ast instanceof OperateNode) {
        let left = _infer(ast.left, env)
        let right = _infer(ast.right, env)
        // console.log('-------op', left, right)
        if (left == 'any') {
            if (ast.left instanceof NameNode) {
                // console.log('-------set left', right)
                env.set(ast.left.name, right)
            }
            return right
        } else if (right == 'any') {
            if (ast.right instanceof NameNode) {
                // console.log('-------set right', left)
                env.set(ast.right.name, left)
            }
            return left
        } else {
            return 'any'
        }
    }

    console.log('-------Invalid Ast', ast)
    throw new Error("Invalid Ast")
}

const infer = function (code: string) {
    let tokenizer = new Tokenizer(code)
    let tokens = tokenizer.tokenize()
    let parser = new Parser(tokens)
    let ast = parser.parse()
    console.log('-------ast', ast)
    let env = new Env()
    _infer(ast, env)
    env.debug()
}

export { infer }
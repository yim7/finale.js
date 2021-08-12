import { Env } from "./env"
import { Ast, NameNode, ModuleNode, ArrayNode, ObjectNode, IndexNode, AssignNode, FunctionNode, ReturnNode, CallNode, IfNode, BlockNode, DeclareNode, MemberNode, OperateNode, Parser } from "./parser"
import { Tokenizer } from "./tokenizer"



const OperatorActions: { [key: string]: (a: any, b: any) => any } = {
    '==': (a: any, b: any) => a == b,
    '!=': (a: any, b: any) => a != b,
    '>': (a: any, b: any) => a > b,
    '>=': (a: any, b: any) => a >= b,
    '<': (a: any, b: any) => a < b,
    '<=': (a: any, b: any) => a <= b,
    '+': (a: any, b: any) => a + b,
    '-': (a: any, b: any) => a - b,
    '*': (a: any, b: any) => a * b,
    '/': (a: any, b: any) => a / b,
    '%': (a: any, b: any) => a % b,
}


const _eval = function (ast: Ast, env: Env) {
    if (typeof ast == 'number') {
        return ast
    } else if (typeof ast == 'string') {
        return ast
    } else if (typeof ast == 'boolean') {
        return ast
    } else if (ast == null || ast == undefined) {
        return null
    } else if (ast instanceof NameNode) {
        let name = ast.name
        let value = env.get(name)
        if (value === undefined) {
            throw new Error(`Undefined variable: ${name}`);
        }
        // console.log('-------eval variable', env.state)
        return value
    } else if (ast instanceof Function) {
        return ast
    } else if (ast instanceof ModuleNode) {
        for (const s of ast.statements) {
            _eval(s, env)
        }
    } else if (ast instanceof ArrayNode) {
        return ast.elements.map((e) => _eval(e, env))
    } else if (ast instanceof ObjectNode) {
        let o = {}
        for (const [k, v] of Object.entries(ast.obj)) {
            o[k] = _eval(v, env)
        }
        return o
    } else if (ast instanceof IndexNode) {
        let obj = _eval(ast.object, env)
        let i = _eval(ast.index, env)
        return obj[i]
    } else if (ast instanceof MemberNode) {
        let obj = _eval(ast.object, env)
        let v = obj[ast.name]
        if (v instanceof Function) {
            console.log('-------bind this', v, obj)
            v = v.bind(obj)
        }
        return v
    } else if (ast instanceof DeclareNode) {
        let name = ast.name
        if (env.include(name)) {
            throw new Error(`Variable already declared: ${name}`);
        }
        let value = _eval(ast.value, env)
        // console.log('-------assign', name, '=', value)
        env.declare(name, value)
    } else if (ast instanceof AssignNode) {
        let target = ast.target
        if (target instanceof NameNode) {
            let name = target.name
            let value = _eval(ast.value, env)
            // console.log('-------assign', name, '=', value)
            env.set(name, value)
        } else if (target instanceof IndexNode) {
            let obj = _eval(target.object, env)
            let i = _eval(target.index, env)
            obj[i] = _eval(ast.value, env)
        } else if (target instanceof MemberNode) {
            let obj = _eval(target.object, env)
            let name = target.name
            obj[name] = _eval(ast.value, env)
        } else {
            console.log('-------assign to target', target)
            throw new Error("Invalid Assign Target");
        }

    } else if (ast instanceof FunctionNode) {
        let name = ast.name
        if (name) {
            env.set(name, ast)
        }
        ast.env = env
        return ast
    } else if (ast instanceof CallNode) {
        let f = _eval(ast.expr, env)
        // console.log('-------eval call', f)
        // 绑定函数参数到函数作用域
        if (f instanceof FunctionNode) {
            let args = f.args
            let params = ast.params

            let newEnv = new Env(f.env)
            for (let i = 0; i < args.length; i++) {
                let arg = args[i]
                let param = _eval(params[i], env)
                // console.log('-------arg param', arg, param)
                newEnv.declare(arg, param)
            }
            // console.log('-------eval call env', newEnv)
            return _eval(f.body, newEnv)
        } else if (f instanceof Function) {
            let params = ast.params.map((e) => _eval(e, env))
            // console.log('-------params', params)
            return f(...params)
        }
        throw new Error(`Not function: ${f}`);
    } else if (ast instanceof BlockNode) {
        let r
        for (const s of ast.statements) {
            r = _eval(s, env)
        }
        return r
    } else if (ast instanceof ReturnNode) {
        return _eval(ast.expr, env)
    } else if (ast instanceof OperateNode) {
        let left: any = _eval(ast.left, env)
        let right: any = _eval(ast.right, env)
        let action = OperatorActions[ast.op]
        return action(left, right)
    } else if (ast instanceof IfNode) {
        let success = false
        for (const b of ast.ifBranches) {
            let r = _eval(b.test, env)
            if (typeof r != 'boolean') {
                throw new Error(`If expected a boolean value, get ${r}`);
            }
            if (r) {
                let blockEnv = new Env(env)
                _eval(b.block, blockEnv)
                success = true
                break
            }
        }
        if (!success && ast.elseBlock) {
            let blockEnv = new Env(env)
            _eval(ast.elseBlock, blockEnv)
        }
    }
    else {
        console.log('-------invalid ast', ast)
        throw new Error(`Invalid AST`);

    }
}


const glEval = function (code: string) {
    let tokenizer = new Tokenizer(code)
    let tokens = tokenizer.tokenize()
    let parser = new Parser(tokens)
    let ast = parser.parse()

    let env = new Env()
    return _eval(ast, env)
}


export {
    glEval,
}
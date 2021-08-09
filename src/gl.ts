const log = console.log

// const ensure = function (condition: boolean, msg = 'ensure error') {
//     if (!condition) {
//         throw new Error(msg);

//     }
// }

enum TokenType {
    auto = 'auto',
    roundLeft = '(',
    roundRight = ')',
    bracketLeft = '[',
    bracketRight = ']',
    braceLeft = '{',
    braceRight = '}',
    string = 'string',
    number = 'number',
    keyword = 'keyword',
    name = 'name',
    operator = 'operator',
    comma = ',',
    colon = ':',
    dot = '.',
}

enum OperatorType {
    plus = '+',
    plusAssign = '+=',
    minus = '-',
    minusAssign = '-=',
    multiply = '*',
    multiplyAssign = '*=',
    divide = '/',
    divideAssign = '/=',
    mod = '%',
    modAssign = '%=',
    great = '>',
    greatOrEqual = '>=',
    less = '<',
    lessOrEqual = '<=',
    equal = '==',
    notEqual = '!=',
    assign = '=',
}

enum KeywordType {
    if = 'if',
    else = 'else',
    while = 'while',
    const = 'const',
    var = 'var',
    function = 'function',
    return = 'return',
    true = 'true',
    false = 'false',
    null = 'null',
}

class Token {
    readonly value: any
    readonly type: TokenType
    readonly start: number
    readonly length: number

    constructor(value: any, type: TokenType, start: number, length: number) {
        if (type == TokenType.auto) {
            type = value as TokenType
        }
        this.value = value
        this.type = type
        this.start = start
        this.length = length
    }
}

class NumberToken extends Token {
    readonly value: number

    constructor(value: number, start: number, length: number) {
        super(value, TokenType.number, start, length)
        this.value = value
    }
}

class StringToken extends Token {
    declare readonly value: string

    constructor(value: string, start: number, length: number) {
        super(value, TokenType.number, start, length)
    }
}

class NameToken extends Token {
    declare readonly value: string

    constructor(value: string, start: number, length: number) {
        super(value, TokenType.name, start, length)
    }
}

class KeywordToken extends Token {
    declare readonly value: string
    readonly keywordType: KeywordType

    constructor(value: string, keywordType: KeywordType, start: number, length: number) {
        super(value, TokenType.keyword, start, length)
        this.keywordType = keywordType
    }
}

class OperatorToken extends Token {
    declare readonly value: string
    readonly operatorType: OperatorType

    constructor(value: string, operatorType: OperatorType, start: number, length: number) {
        super(value, TokenType.operator, start, length)
        this.operatorType = operatorType
    }
}


function isSpace(c: string) {
    return ' \n\r\t'.includes(c)
}

function isDigit(c: string) {
    return '0123456789'.includes(c)
}

function isLetter(c: string) {
    return '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(c)
}

function isAuto(c: string) {
    return '{}[](),:.'.includes(c)
}

function isOperator(c: string) {
    return '+-*/%=!><'.includes(c)
}

function getkeywordType(s: string): KeywordType | null {
    let keywords: { [key: string]: KeywordType } = {
        'if': KeywordType.if,
        'else': KeywordType.else,
        'while': KeywordType.while,
        'const': KeywordType.const,
        'var': KeywordType.var,
        'function': KeywordType.function,
        'return': KeywordType.return,
        'true': KeywordType.true,
        'false': KeywordType.false,
        'null': KeywordType.null,
    }

    return keywords[s]
}

class Tokenizer {
    index: number = 0
    code: string

    constructor(code: string) {
        this.code = code
    }

    tokenize() {
        let ts: Token[] = []
        let code = this.code
        while (this.index < code.length) {
            let i = this.index
            let c = code[i]
            if (isSpace(c)) {
                // skip white space
            } else if (c == '/' && code[i + 1] == '/') {
                this.readComment()
            } else if (isOperator(c)) {
                if (code[i + 1] == '=') {
                    let op = code.substr(i, 2)
                    let t = new OperatorToken(c, op as OperatorType, i, 2)
                    this.index += 1
                    ts.push(t)
                } else {
                    let t = new OperatorToken(c, c as OperatorType, i, 1)
                    ts.push(t)
                }
            } else if (isAuto(c)) {
                let t = new Token(c, TokenType.auto, i, 1)
                ts.push(t)
            } else if (isDigit(c)) {
                let e = this.readNumber()
                let length = this.index - i + 1
                let t = new NumberToken(e, i, length)
                ts.push(t)
            } else if (isLetter(c)) {
                let e = this.readName()
                let length = this.index - i + 1
                let keywordType = getkeywordType(e)
                if (keywordType != undefined) {
                    let t = new KeywordToken(e, keywordType, i, length)
                    ts.push(t)
                } else {
                    let t = new NameToken(e, i, length)
                    ts.push(t)
                }

            } else if (c == '"' || c == '\'') {
                let e = this.readString()
                let length = this.index - i + 1
                let t = new StringToken(e, i, length)
                ts.push(t)
            } else {
                throw new Error(`invalid token: ${c}`);
            }

            this.index += 1
        }
        return ts
    }

    readComment() {
        let code = this.code
        let start = this.index + 2
        let i = start
        while (true) {
            let c = code[i]
            if (c == '\n' || i >= code.length) {
                let s = code.slice(start, i)
                // log('read coment:', s)
                this.index = i
                return s
            }
            i += 1
        }
    }

    readNumber() {
        let code = this.code
        let start = this.index
        let i = start
        while (true) {
            let c = code[i]
            if (!isDigit(c) || i >= code.length) {
                let n = code.slice(start, i)
                // log('read number:', n)
                this.index = i - 1
                return parseInt(n)
            }
            i += 1
        }
    }

    readName() {
        let code = this.code
        let start = this.index
        let i = start
        while (true) {
            let c = code[i]
            if (!isLetter(c) && !isDigit(c) || i >= code.length) {
                let n = code.slice(start, i)
                // log('read name:', n)
                this.index = i - 1
                return n
            }
            i += 1
        }
    }

    readString() {
        let code = this.code
        let quote = code[this.index]
        // 跳过开始的单引号
        let start = this.index + 1
        let i = start
        while (true) {
            let c = code[i]
            if (c == quote || i >= code.length) {
                let s = code.slice(start, i)
                // log('read string:', s)
                this.index = i
                return s
            }
            i += 1
        }
    }
}

class IfBranch {
    test: Expr
    block: BlockNode
    constructor(test: Expr, block: BlockNode) {
        this.test = test
        this.block = block
    }
}

class IfNode {
    ifBranches: IfBranch[]
    elseBlock?: BlockNode
    constructor(ifBranches: IfBranch[], elseBlock?: BlockNode | undefined) {
        this.ifBranches = ifBranches
        this.elseBlock = elseBlock
    }
}

class WhileNode {
    test: Expr
    body: Expr
    constructor(test: Expr, body: Expr) {
        this.test = test
        this.body = body
    }
}

class FunctionNode {
    name: string | undefined
    args: string[]
    body: BlockNode
    constructor(name: string | undefined, args: string[], body: BlockNode) {
        this.name = name
        this.args = args
        this.body = body
    }
}

class CallNode {
    expr: Expr
    params: Expr[]
    constructor(expr: Expr, params: Expr[]) {
        this.expr = expr
        this.params = params
    }
}

class OperateNode {
    left: Expr
    op: OperatorType
    right: Expr

    constructor(left: Expr, op: OperatorType, right: Expr) {
        this.left = left
        this.op = op
        this.right = right
    }
}

class CompareNode {
    left: Expr
    op: OperatorType
    right: Expr

    constructor(left: Expr, op: OperatorType, right: Expr) {
        this.left = left
        this.op = op
        this.right = right
    }
}

class ModuleNode {
    statements: Statement[]
    constructor(statements: Statement[]) {
        this.statements = statements
    }
}

class BlockNode {
    statements: Statement[]
    constructor(statements: Statement[]) {
        this.statements = statements
    }
}

class ReturnNode {
    expr: Expr

    constructor(expr: Expr) {
        this.expr = expr
    }
}

class NameNode {
    name: string

    constructor(name: string) {
        this.name = name
    }
}

class ArrayNode {
    elements: Expr[]

    constructor(elements: Expr[]) {
        this.elements = elements
    }
}

class IndexNode {
    object: Expr
    index: Expr

    constructor(object: Expr, index: Expr) {
        this.object = object
        this.index = index
    }
}

class MemberNode {
    object: Expr
    name: string

    constructor(object: Expr, name: string) {
        this.object = object
        this.name = name
    }
}

class DeclareNode {
    name: string
    value: Expr
    isConst: boolean = false

    constructor(name: string, value: Expr, isConst: boolean = false) {
        this.name = name
        this.value = value
        this.isConst = isConst
    }
}

class AssignNode {
    target: NameNode | MemberNode | IndexNode
    value: Expr

    constructor(target: NameNode | MemberNode | IndexNode, value: Expr) {
        this.target = target
        this.value = value
    }
}

type Expr = boolean | null | number | string | NameNode | CompareNode | OperateNode | FunctionNode | CallNode | ArrayNode | Function | IndexNode | Object
type Statement = Expr | IfNode | WhileNode | AssignNode | DeclareNode | ReturnNode | ModuleNode | BlockNode
type Ast = Expr | Statement

class Parser {
    tokens: Token[]
    index: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    hasToken() {
        return this.index < this.tokens.length
    }

    readToken() {
        let t = this.tokens[this.index]
        this.index += 1
        return t
    }

    readNameToken() {
        let t = this.readToken()
        if (t instanceof NameToken) {
            return t
        } else {
            throw new Error(`Token is not varibale: ${t.value}`);
        }
    }

    peekToken(n: number = 0) {
        let i = this.index + n
        return this.tokens[i]
    }

    peekTokenType(n: number = 0) {
        let t = this.peekToken(n)
        return t.type
    }

    peekKeywordType(n: number = 0) {
        let t = this.peekToken(n)
        if (t instanceof KeywordToken) {
            return t.keywordType
        } else {
            throw new Error(`Token is not keyword: ${t.value}`);
        }
    }

    readOperatorToken() {
        let t = this.readToken()
        if (t instanceof OperatorToken) {
            return t
        } else {
            throw new Error(`Token is not operator: ${t.value}`);
        }
    }

    readKeywordToken() {
        let t = this.readToken()
        if (t instanceof KeywordToken) {
            return t
        } else {
            throw new Error(`Token is not keyword: ${t.value}`);
        }
    }

    ensureTokenType(type: TokenType) {
        let t = this.readToken()
        if (t.type == type) {
            return t
        } else {
            throw new Error(`Unexpected token type: ${t.value}`);
        }
    }

    ensureKeywordType(keywordType: KeywordType) {
        let t = this.readKeywordToken()
        if (t.keywordType == keywordType) {
            return t
        } else {
            throw new Error(`Unexpected keyword: ${t.value}`);
        }
    }

    ensureOperatorType(operatorType: OperatorType) {
        let t = this.readOperatorToken()
        if (t.operatorType == operatorType) {
            return t
        } else {
            throw new Error(`Unexpected operator: ${t.value}`);
        }
    }

    parse() {
        let statements: Statement[] = []
        while (this.hasToken()) {
            let statement = this.parseStatement()
            // console.log('-------statement', statement)

            statements.push(statement)
        }

        return new ModuleNode(statements)

    }

    parseStatement(): Statement {
        let token = this.peekToken()
        if (token instanceof KeywordToken) {
            let kt = token.keywordType
            // const a = 1
            if (kt == KeywordType.const || kt == KeywordType.var) {
                return this.parseDeclare()
            }
            // if (true) {}
            if (kt == KeywordType.if) {
                return this.parseIf()
            }
            // while () {}
            if (kt == KeywordType.while) {
                // return this.parseWhile()
            }

            if (kt == KeywordType.return) {
                return this.parseReturn()
            }

            throw new Error(`Invalid Syntax: ${token.value}`);
        }

        if (token.type == TokenType.braceLeft) {
            return this.parseBlock()
        }

        return this.parseAssign()
    }

    parseReturn() {
        this.ensureKeywordType(KeywordType.return)
        let expr = this.parseExpr()
        // console.log('-------return', expr)

        return expr
    }

    parseBlock() {
        this.ensureTokenType(TokenType.braceLeft)

        let statements: Statement[] = []
        while (true) {
            let t = this.peekToken()
            // 找到配对的 } 结束 block
            if (t.type == TokenType.braceRight) {
                this.readToken()
                break
            }

            let statement = this.parseStatement()
            // console.log('-------block statement', statement)
            statements.push(statement)
        }

        return new BlockNode(statements)
    }

    parseIfTest() {
        this.ensureTokenType(TokenType.roundLeft)
        let test = this.parseExpr()
        this.ensureTokenType(TokenType.roundRight)
        return test
    }

    parseIf() {
        this.ensureKeywordType(KeywordType.if)
        let test = this.parseIfTest()
        let ifBlock = this.parseBlock()

        let ifBranches: IfBranch[] = [new IfBranch(test, ifBlock)]
        let elseBlock: BlockNode | undefined = undefined

        while (true) {
            let next = this.peekToken()
            if (next instanceof KeywordToken && next.keywordType == KeywordType.else) {
                this.readToken()
                next = this.peekToken()
                if (next instanceof KeywordToken && next.keywordType == KeywordType.if) {
                    this.readToken()
                    let test = this.parseIfTest()
                    let block = this.parseBlock()
                    ifBranches.push(new IfBranch(test, block))
                } else {
                    elseBlock = this.parseBlock()
                    break
                }
            } else {
                break
            }
        }

        return new IfNode(ifBranches, elseBlock)
    }

    parseWhile() {
        throw new Error("not implement");
    }

    // a = 2
    // o.name = 'ss'
    parseAssign() {
        let expr = this.parseExpr()
        // console.log('-------parse assign', expr)
        let next = this.peekToken()
        if (next instanceof OperatorToken && next.operatorType == OperatorType.assign) {
            if (expr instanceof NameNode || expr instanceof MemberNode || expr instanceof IndexNode) {
                this.readToken()
                let value = this.parseExpr()
                return new AssignNode(expr, value)
            } else {
                throw new Error("Invalid Assign Target");

            }
        }
        return expr
    }

    // const a = 1
    parseDeclare() {
        let keyword = this.readKeywordToken()
        let isConst = keyword.keywordType == KeywordType.const ? true : false

        let name = this.readNameToken().value
        this.ensureOperatorType(OperatorType.assign)
        let value = this.parseExpr()
        return new DeclareNode(name, value, isConst)
    }

    parseExpr(): Expr {
        let token = this.peekToken()
        if (token instanceof KeywordToken) {
            // function () {}
            if (token.keywordType == KeywordType.function) {
                return this.parseFunction()
            }
        }

        return this.parsePlusMinus()
    }

    // 1 + (2 * 3) + 2
    parsePlusMinus() {
        let expr = this.parseMulDiv()

        while (true) {
            let token = this.peekToken()
            // console.log('-------parse +-1', token.value)
            if (token instanceof OperatorToken) {
                // console.log('-------parse +-2', token.value) 
                let op = token.operatorType
                if (op == OperatorType.plus || op == OperatorType.minus) {
                    this.readToken()
                    let right = this.parseMulDiv()
                    expr = new OperateNode(expr, op, right)
                } else {
                    break
                }
            } else {
                break
            }
        }

        return expr
    }

    parseMulDiv() {
        let expr = this.parseSigned()

        while (true) {
            let token = this.peekToken()
            // console.log('-------parse */1', token) 
            if (token instanceof OperatorToken) {
                let op = token.operatorType
                if (op == OperatorType.multiply || op == OperatorType.divide) {
                    // console.log('-------parse */2', op) 
                    this.readToken()
                    let right = this.parseSigned()
                    expr = new OperateNode(expr, op, right)
                } else {
                    // console.log('-------parse */3', op) 
                    break
                }
            } else {
                break
            }
        }

        return expr
    }

    // +1, -1
    parseSigned() {
        let token = this.peekToken()
        if (token instanceof OperatorToken) {
            let op = token.operatorType
            if (op == OperatorType.plus || op == OperatorType.minus) {
                this.readToken()
                let right = this.parseSigned()
                return new OperateNode(0, op, right)
            } else {
                throw new Error(`Unexpected op: ${op}`);
            }
        }

        return this.parseCall()
    }

    // log(), a[1], obj.name
    parseCall() {
        let expr = this.parsePrimary()

        while (true) {
            let next = this.peekToken()
            // console.log('-------parse call', next)
            if (next === undefined) {
                break
            }
            // 函数调用, f()
            if (next.type == TokenType.roundLeft) {
                this.readToken()
                let params: Expr[] = []
                while (true) {
                    let token = this.peekToken()
                    if (token.type == TokenType.roundRight) {
                        this.readToken()
                        break
                    }

                    let param = this.parseExpr()
                    params.push(param)

                    let tail = this.peekToken()
                    if (tail.type == TokenType.comma) {
                        this.readToken()
                    } else if (tail.type == TokenType.roundRight) {
                        this.readToken()
                        break
                    } else {
                        throw new Error("Invalid Call");
                    }
                }

                expr = new CallNode(expr, params)

            }
            // 对象索引, a[1]
            else if (next.type == TokenType.bracketLeft) {
                this.readToken()
                let index = this.parseExpr()
                // console.log('-------index', index)
                if (typeof index == 'string' || typeof index == 'number' || index instanceof OperateNode || index instanceof NameNode) {
                    this.ensureTokenType(TokenType.bracketRight)
                    expr = new IndexNode(expr, index)
                } else {
                    throw new Error(`Invalid Index Syntax: ${JSON.stringify(index)}`)
                }
            }
            // 对象属性访问
            else if (next.type == TokenType.dot) {
                this.readToken()
                let name = this.readNameToken().value
                expr = new MemberNode(expr, name)
            } else {
                break
            }
        }


        return expr
    }

    parsePrimary() {
        let token = this.peekToken()
        let type = token.type
        if (token instanceof KeywordToken) {
            this.readToken()
            let keyword = token.keywordType
            if (keyword == KeywordType.true) {
                return true
            }
            if (keyword == KeywordType.false) {
                return false
            }
            if (keyword == KeywordType.null) {
                return null
            }
        }
        if (type == TokenType.number) {
            return this.readToken().value
        }
        if (type == TokenType.string) {
            return this.readToken().value
        }
        if (type == TokenType.name) {
            return new NameNode(this.readToken().value)
        }
        if (type == TokenType.bracketLeft) {
            return this.parseArray()
        }
        console.log('-------Invalid Primary Expr:', token)
        throw new Error(`Invalid primary expr: ${token}`);
    }

    parseArray() {
        this.ensureTokenType(TokenType.bracketLeft)
        var es: Expr[] = []
        while (true) {
            let t = this.peekToken()
            if (t.type == TokenType.bracketRight) {
                this.readToken()
                break
            }
            let e = this.parseExpr()
            es.push(e)

            t = this.peekToken()
            if (t.type == TokenType.comma) {
                this.readToken()
            } else if (t.type == TokenType.bracketRight) {
            }
        }

        return new ArrayNode(es)
    }
    parseFunction() {
        this.ensureKeywordType(KeywordType.function)

        let args: string[] = []

        this.ensureTokenType(TokenType.roundLeft)
        while (true) {
            let t = this.readToken()
            if (t.type == TokenType.roundRight) {
                break
            } else if (t.type == TokenType.name) {
                args.push(t.value)
            } else {
                throw new Error(`Invalid function arg: ${t.value}`);

            }

            let next = this.readToken()
            if (next.type == TokenType.comma) {
            } else {
                break
            }
        }

        let body = this.parseBlock()
        return new FunctionNode(undefined, args, body)
    }
}

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

class Env {
    state: { [key: string]: Expr } = {}
    parent?: Env
    constructor(parent?: Env) {
        this.registerBuiltin()
        this.parent = parent
    }

    registerBuiltin() {
        this.state = {
            log: function (...args) {
                console.log('[LOG]', ...args)
            },
            document: document
        }
    }

    get(name: string) {
        let o: Env | undefined = this
        while (o !== undefined) {
            if (o.include(name)) {
                return o.state[name]
            } else {
                o = this.parent
            }
        }
        return undefined
    }

    set(name: string, value: Expr) {
        if (value == undefined) {
            value = null
        }
        let o: Env | undefined = this
        while (o !== undefined) {
            if (o.include(name)) {
                o.state[name] = value
            } else {
                o = this.parent
            }
        }
    }

    declare(name: string, value: Expr) {
        if (value == undefined) {
            value = null
        }
        this.state[name] = value
    }

    include(name: string) {
        return this.state.hasOwnProperty(name)
    }
}

const glEval = function (ast: Ast, env: Env) {
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
            glEval(s, env)
        }
    } else if (ast instanceof ArrayNode) {
        return ast.elements.map((e) => glEval(e, env))
    } else if (ast instanceof IndexNode) {
        let obj = glEval(ast.object, env)
        let i = glEval(ast.index, env)
        return obj[i]
    } else if (ast instanceof MemberNode) {
        let obj = glEval(ast.object, env)
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
        let value = glEval(ast.value, env)
        // console.log('-------assign', name, '=', value)
        env.declare(name, value)
    } else if (ast instanceof AssignNode) {
        let target = ast.target
        if (target instanceof NameNode) {
            let name = target.name
            let value = glEval(ast.value, env)
            // console.log('-------assign', name, '=', value)
            env.set(name, value)
        } else if (target instanceof IndexNode) {
            let obj = glEval(target.object, env)
            let i = glEval(target.index, env)
            obj[i] = glEval(ast.value, env)
        } else if (target instanceof MemberNode) {
            let obj = glEval(target.object, env)
            let name = target.name
            obj[name] = glEval(ast.value, env)
        } else {
            console.log('-------assign to target', target)
            throw new Error("Invalid Assign Target");
        }

    } else if (ast instanceof FunctionNode) {
        let name = ast.name
        if (name) {
            env.set(name, ast)
        }
        return ast
    } else if (ast instanceof CallNode) {
        let f = glEval(ast.expr, env)
        // console.log('-------eval call', f)
        // 绑定函数参数到函数作用域
        if (f instanceof FunctionNode) {
            let args = f.args
            let params = ast.params

            let newEnv = new Env()
            for (let i = 0; i < args.length; i++) {
                let arg = args[i]
                let param = glEval(params[i], env)
                // console.log('-------arg param', arg, param)
                newEnv.declare(arg, param)
            }
            // console.log('-------eval call env', newEnv)
            return glEval(f.body, newEnv)
        } else if (f instanceof Function) {
            let params = ast.params.map((e) => glEval(e, env))
            // console.log('-------params', params)
            return f(...params)
        }
        throw new Error(`Not function: ${f}`);
    } else if (ast instanceof BlockNode) {
        let r
        for (const s of ast.statements) {
            r = glEval(s, env)
        }
        return r
    } else if (ast instanceof ReturnNode) {
        return glEval(ast.expr, env)
    } else if (ast instanceof OperateNode) {
        let left: any = glEval(ast.left, env)
        let right: any = glEval(ast.right, env)
        let action = OperatorActions[ast.op]
        return action(left, right)
    } else if (ast instanceof IfNode) {
        let success = false
        for (const b of ast.ifBranches) {
            let r = glEval(b.test, env)
            if (typeof r != 'boolean') {
                throw new Error(`If expected a boolean value, get ${r}`);
            }
            if (r) {
                let blockEnv = new Env(env)
                glEval(b.block, blockEnv)
                success = true
                break
            }
        }
        if (!success && ast.elseBlock) {
            let blockEnv = new Env(env)
            glEval(ast.elseBlock, blockEnv)
        }
    }
    else {
        console.log('-------invalid ast', ast)
        throw new Error(`Invalid AST`);

    }
}


export {
    Tokenizer, Parser, glEval, Env
}
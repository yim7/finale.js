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
    dot = ':',
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
    return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(c)
}

function isAuto(c: string) {
    return '{}[]()'.includes(c)
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

            } else if (c == '"') {
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

    readNumber() {
        let code = this.code
        let start = this.index
        let i = start
        while (true) {
            let c = code[i]
            if (!isDigit(c)) {
                let n = code.slice(start, i)
                log('read number:', n)
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
            if (!isLetter(c)) {
                let n = code.slice(start, i)
                log('read name:', n)
                this.index = i - 1
                return n
            }
            i += 1
        }
    }

    readString() {
        let code = this.code
        // 跳过开始的单引号
        let start = this.index + 1
        let i = start
        while (true) {
            let c = code[i]
            if (c == '"') {
                let s = code.slice(start, i)
                log('read string:', s)
                this.index = i
                return s
            }
            i += 1
        }
    }
}

class ElseIfNode {
    test: Expr
    block: BlockNode
    constructor(test: Expr, block: BlockNode) {
        this.test = test
        this.block = block
    }
}

class IfNode {
    test: Expr
    ifBlock: BlockNode
    elseIfBlocks?: ElseIfNode[]
    elseBlock?: BlockNode
    constructor(test: Expr, ifBlock: BlockNode, elseIfBlocks?: ElseIfNode[], elseBlock?: BlockNode | undefined) {
        this.test = test
        this.ifBlock = ifBlock
        this.elseIfBlocks = elseIfBlocks
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

class AssignNode {
    name: string
    value: Expr
    isConst: boolean = false

    constructor(name: string, value: Expr, isConst: boolean = false) {
        this.name = name
        this.value = value
        this.isConst = isConst
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

type Expr = boolean | number | string | NameNode | CompareNode | OperateNode | FunctionNode | CallNode | ArrayNode
type Statement = Expr | IfNode | WhileNode | AssignNode | ReturnNode | ModuleNode | BlockNode
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
            console.log('-------statement', statement)

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
                return this.parseAssign()
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

        return this.parseExpr()
    }

    parseReturn() {
        this.ensureKeywordType(KeywordType.return)
        let expr = this.parseExpr()
        console.log('-------return', expr)
        
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
            console.log('-------block statement', statement)
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

        let elseIfNodes: ElseIfNode[] = []
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
                    elseIfNodes.push(new ElseIfNode(test, block))
                } else {
                    elseBlock = this.parseBlock()
                    break
                }
            } else {
                break
            }
        }

        return new IfNode(test, ifBlock, elseIfNodes, elseBlock)
    }

    parseWhile() {
        throw new Error("not implement");
    }

    parseAssign() {
        let keyword = this.readKeywordToken()
        let isConst = keyword.keywordType == KeywordType.const ? true : false

        let name = this.readNameToken().value
        this.ensureOperatorType(OperatorType.assign)
        let value = this.parseExpr()
        return new AssignNode(name, value, isConst)
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
        let next = this.peekToken()
        if (!next) {
            return expr
        }

        // 函数调用
        if (next.type == TokenType.roundLeft) {

        }

        if (next.type == TokenType.braceRight) {

        }

        if (next.type == TokenType.dot) {

        }

        return expr
    }

    parsePrimary() {
        let token = this.peekToken()
        let type = token.type
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

        throw new Error(`Invalid primary expr: ${type}`);
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

const glEval = function (ast: Ast, env: { [key: string]: Expr }) {
    if (typeof ast == 'number') {
        return ast
    } else if (typeof ast == 'string') {
        return ast
    } else if (typeof ast == 'boolean') {
        return ast
    } else if (ast instanceof AssignNode) {
        let name = ast.name
        let value = glEval(ast.value, env)
        log(`assign: ${name} = ${value}`)
        env[name] = value
    } else if (ast instanceof FunctionNode) {
        let name = ast.name
        if (name) {
            env[name] = ast
        }
        return ast
    } else if (ast instanceof OperateNode) {
        let left: any = glEval(ast.left, env)
        let right: any = glEval(ast.right, env)
        let action = OperatorActions[ast.op]
        return action(left, right)
    } else if (ast instanceof ModuleNode) {
        for (const s of ast.statements) {
            glEval(s, env)
        }
    }
}


export {
    Tokenizer, Parser, glEval
}
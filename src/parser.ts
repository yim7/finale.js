import { Token, TokenType, KeywordToken, KeywordType, NameToken, OperatorToken, OperatorType } from "./tokenizer"
import { Env } from "./env"

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
    env: Env | undefined = undefined
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

class ObjectNode {
    obj: Object

    constructor(obj: Object) {
        this.obj = obj
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

type Expr = boolean | null | number | string | NameNode | CompareNode | OperateNode | FunctionNode | CallNode | Function | IndexNode | Object | Array<Expr> | ObjectNode | ArrayNode
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

        return new ReturnNode(expr)
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

    parsePrimary(): Expr {
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
        if (type == TokenType.braceLeft) {
            return this.parseObject()
        }
        console.log('-------Invalid Primary Expr:', token)
        throw new Error(`Invalid primary expr: ${token}`);
    }

    parseObject() {
        this.ensureTokenType(TokenType.braceLeft)
        var o = {}
        while (true) {
            let t = this.peekToken()
            if (t.type == TokenType.braceRight) {
                this.readToken()
                break
            }
            let token = this.peekToken()
            if (token.type != TokenType.name && token.type != TokenType.keyword && token.type != TokenType.string) {
                console.log('-------obj key', token)
                throw new Error("Invalid Object Key")
            }
            let key = this.readToken().value
            this.ensureTokenType(TokenType.colon)
            let value = this.parseExpr()
            o[key] = value

            let next = this.peekToken()
            if (next.type == TokenType.comma) {
                this.readToken()
            } else if (next.type == TokenType.braceRight) {
                this.readToken()
                break
            } else {
                throw new Error("Invalid Object Syntax");
            }
        }

        return new ObjectNode(o)
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



export { Expr, Statement, Ast, IfNode, NameNode, WhileNode, FunctionNode, CallNode, ReturnNode, BlockNode, ModuleNode, ArrayNode, ObjectNode, IndexNode, MemberNode, DeclareNode, OperateNode, AssignNode, Parser }
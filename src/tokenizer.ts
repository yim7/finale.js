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
        super(value, TokenType.string, start, length)
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
        'con': KeywordType.const,
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

export { TokenType, KeywordType, OperatorType, Token, KeywordToken, OperatorToken, NameToken, Tokenizer, }
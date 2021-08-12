import { Expr } from "./parser";
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
                // console.log('-------find in parent', this.parent?.state)
                o = this.parent
            }
        }
        throw new Error("Variable not declared");
    }

    set(name: string, value: Expr) {
        if (value == undefined) {
            value = null
        }
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

export { Env }
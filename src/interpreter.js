const lexer = require('./lexer');
const parser = require('./parser');

function preprocess(code) {
    return parser.parse(
        lexer.lex(code));
}

function op_bin(op, left, right) {
    switch (op.value) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '%': return left % right;
        case '<': return left < right;
        case '>': return left > right;
        case '<=': return left <= right;
        case '>=': return left >= right;
        case '==': return left === right;
        case '!=': return left !== right;
        case '&&': return !!(left && right);
        case '||': return !!(left || right);
    }
}

function eval(context, scope, statement) {
    const clone = Object.assign({}, scope);
    if (statement.type === 'OPERATION') {
        if (statement.subtype === 'BINARY') {
            const left = eval(context, clone, statement.left);
            const right = eval(context, clone, statement.right);
            return op_bin(statement.op, left, right);
        } else if ([ 'ASSIGN', 'ASSIGN_ADD', 'ASSIGN_SUB', 'ASSIGN_MUL', 'ASSIGN_DIV' ].includes(statement.subtype)) {
            const val = eval(context, clone, statement.value);
            if (typeof val === 'object') {
                return scope[`${statement.identifier}(${val.param_list.length})`] = val;
            } else {
                return scope[statement.identifier] = val;
            }
        } else if (statement.subtype === 'TERNARY') {
            const condition = !!eval(context, clone, statement.condition);
            return condition ? eval(context, clone, statement.left) : eval(context, clone, statement.right);
        }
    } else if (statement.type === 'LITERAL') {
        if (statement.subtype === 'NUMERIC') {
            return statement.value;
        } else if (statement.subtype === 'STRING') {
            return statement.value;
        }
    } else if (statement.type === 'EVAL') {
        if (statement.subtype === 'VARIABLE') {
            return scope[statement.identifier];
        } else if (statement.subtype === 'FUNCTION') {
            const signature = `${statement.identifier}(${statement.arguments.length})`;
            if (signature in scope
                    && scope[signature].type === 'DECLARATION'
                    && scope[signature].subtype === 'FUNCTION') {
                const func = scope[signature];
                const args = {};
                func.param_list.some((def, idx) => {
                    const arg = statement.arguments[idx];
                    if (arg.type === 'LITERAL') {
                        args[def.text] = arg.value;
                    } else if (arg.type === 'DECLARATION' && arg.subtype === 'FUNCTION') {
                        args[`${def.text}(${arg.param_list.length})`] = arg;
                    } else {
                        args[def.text] = eval(context, clone, arg);
                    }
                    return idx >= statement.arguments.length - 1;
                });
                const newScope = Object.assign({}, scope, args);
                return interpret_block(func.definition, context, newScope);
            } else if (signature in context) {
                return context[signature](...statement.arguments.map(arg => {
                    if (arg.type === 'EVAL' && arg.subtype === 'VARIABLE') {
                        return scope[arg.identifier]
                    } else if (arg.type === 'LITERAL')  {
                        return arg.value;
                    } else {
                        throw `INTERP Error(${arg.line}:${arg.column}): could not interpret argument \`${JSON.stringify(arg)}\``
                    }
                }));
            } else {
                throw `INTERP Error(${statement.line}:${statement.column}): unable to find function with signature \`${signature}\``
            }
        }
    } else if (statement.type === 'DECLARATION') {
        if (statement.subtype === 'FUNCTION') {
            return statement;
        }
    }

    throw `INTERP Error(${statement.line}:${statement.column}): unable to evaluate ${statement.type}.${statement.subtype}`;
}

function interpret_block(statement_list, context={}, scope={}) {
    let result = 0;
    for (let statement of statement_list) {
        result = eval(context, scope, statement);
    }
    return result;
}

module.exports = {
    interpret: function(statement_list, context={}, scope={}) {
        let result = 0;
        for (let statement of statement_list) {
            result = eval(context, scope, statement);
        }
        return result;
    }
    // interpret: function(code, context={}, scope={}) {
    //     const lexims = lexer.lex(code);
    //     const statement_list = [];
    //     try {
    //         statement_list.push(...parser.parse(lexims));
    //     } catch (err) {
    //         console.error(err);
    //     }
    //     return interpret_block(statement_list, context, scope);
    // }
};

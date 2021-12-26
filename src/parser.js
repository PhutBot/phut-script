function _(type, subtype, text) {
    return { type, subtype, text };
}

function def_param_list(lexims) {
    consume(lexims, null, '(');
    const param_list = [];
    if (!is(lexims, null, ')')) {
        do {
            param_list.push(consume(lexims, 'IDENTIFIER'));
        } while (allow(lexims, null, ','));
    }
    consume(lexims, null, ')');
    return param_list;
}

function block(lexims) {
    consume(lexims, null, '{');
    const code_block = statement_list(lexims, '}');
    consume(lexims, null, '}');
    return code_block;
}

function statement_list(lexims, del='EOF') {
    let results = [];
    while (lexims.length > 0 && !is(lexims, null, del)) {
        results.push(statement(lexims));
    }
    return results;
}

function isFuncDecl(lexims) {
    if (!is(lexims, null, '(')) {
        return false;
    }

    let closed = false;
    for (let lexim of lexims) {
        if (closed) {
            return is([ lexim ], null, '->');
        }
        if (is([ lexim ], null, ')')) {
            closed = true;
        }
    }
}

function statement(lexims, semicolon=true) {
    let stmnt = null;
    if (isFuncDecl(lexims)) {
        const param_list = def_param_list(lexims);
        consume(lexims, null, '->');
        const definition = block(lexims);
        return {
            type: 'DECLARATION',
            subtype: 'FUNCTION',
            definition,
            param_list,
            line: definition.line,
            column: definition.column
        };
    } else if (isNext(lexims, 'OPERATOR', ['=', '+=', '-=', '*=', '/=' ])) {
        stmnt = assign(lexims);
    } else {
        stmnt = expr(lexims);
        if (is(lexims, null, '?')) {
            const condition = stmnt;
            consume(lexims, null, '?');
            const left = statement(lexims, false);
            consume(lexims, null, ':');
            const right = statement(lexims, false);
            stmnt = {
                type: 'OPERATION',
                subtype: 'TERNARY',
                condition,
                left,
                right,
                line: condition.line,
                column: condition.column
            };
        }
    }

    if (semicolon) {
        consume(lexims, null, ';');
    }

    return stmnt;
}

function assign_helper(name, op, id, expression) {
    return {
        type: 'OPERATION',
        subtype: `ASSIGN_${name}`,
        identifier: id.text,
        value: {
            type: 'OPERATION',
            subtype: 'ASSIGN',
            identifier: id.text,
            value: {
                type: 'OPERATION',
                subtype: 'BINARY',
                left: {
                    type: 'EVAL',
                    subtype: 'VARIABLE',
                    identifier: id.text,
                    line: expression.line,
                    column: expression.column
                },
                op: {
                    type: `OPERATOR.${op}`,
                    value: op,
                    line: expression.line,
                    column: expression.column
                },
                right: expression,
                line: expression.line,
                column: expression.column
            },
            line: id.line,
            column: id.column
        }
    };
}

function assign(lexims) {
    if (isNext(lexims, null, '=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '=');
        const stmnt = statement(lexims, false);
        return {
            type: 'OPERATION',
            subtype: 'ASSIGN',
            identifier: id.text,
            value: stmnt
        };
    } else if (isNext(lexims, null, '+=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '+=');
        const expression = expr(lexims);
        return assign_helper('ADD', '+', id, expression);
    } else if (isNext(lexims, null, '-=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '-=');
        const expression = expr(lexims);
        return assign_helper('SUB', '-', id, expression);
    } else if (isNext(lexims, null, '*=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '*=');
        const expression = expr(lexims);
        return assign_helper('MUL', '*', id, expression);
    } else if (isNext(lexims, null, '/=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '/=');
        const expression = expr(lexims);
        return assign_helper('DIV', '/', id, expression);
    } else if (isNext(lexims, null, '%=')) {
        const id = consume(lexims, 'IDENTIFIER');
        consume(lexims, 'OPERATOR', '%=');
        const expression = expr(lexims);
        return assign_helper('MOD', '%', id, expression);
    }
}

function expr(lexims) {
    const left = non_logical_expr(lexims);
    if (is(lexims, null, [ '<', '>', '<=', '>=', '==', '!=', '&&', '||' ])) {
        const op = consume(lexims, null, [ '<', '>', '<=', '>=', '==', '!=', '&&', '||' ]);
        const right = non_logical_expr(lexims);
        return {
            type: 'OPERATION',
            subtype: 'BINARY',
            left,
            op: {
                type: `${op.type}.${op.subtype}`,
                value: op.text,
                line: op.line,
                column: op.column
            },
            right,
            line: left.line,
            column: left.column
        };
    }
    return left;
}

function non_logical_expr(lexims) {
    const left = term(lexims);
    if (is(lexims, null, [ '+', '-' ])) {
        const op = consume(lexims, null, [ '+', '-' ]);
        const right = non_logical_expr(lexims);
        return {
            type: 'OPERATION',
            subtype: 'BINARY',
            left,
            op: {
                type: `${op.type}.${op.subtype}`,
                value: op.text,
                line: op.line,
                column: op.column
            },
            right,
            line: left.line,
            column: left.column
        };
    }
    return left;
}

function term(lexims) {
    const left = factor(lexims);
    if (is(lexims, null, [ '*', '/', '%' ])) {
        const op = consume(lexims, null, [ '*', '/', '%' ]);
        const right = term(lexims);
        return {
            type: 'OPERATION',
            subtype: 'BINARY',
            left,
            op: {
                    type: `${op.type}.${op.subtype}`,
                    value: op.text,
                    line: op.line,
                    column: op.column
                },
            right,
            line: left.line,
            column: left.column
        };
    }
    return left;
}

function factor(lexims) {
    if (is(lexims, 'NUMBER')) {
        return number(lexims);
    } else if (is(lexims, 'IDENTIFIER')) {
        const id = consume(lexims, 'IDENTIFIER');
        if (is(lexims, 'PUNCTUATION', '(')) {
            const args = call_param_list(lexims);
            return {
                type: 'EVAL',
                subtype: 'FUNCTION',
                identifier: id.text,
                arguments: args,
                line: id.line,
                column: id.column
            }
        } else {
            return {
                type: 'EVAL',
                subtype: 'VARIABLE',
                identifier: id.text,
                line: id.line,
                column: id.column
            };
        }
    } else if (is(lexims, 'STRING')) {
        const str = consume(lexims, 'STRING');
        return {
            type: 'LITERAL',
            subtype: 'STRING',
            value: str.text, 
            line: str.line,
            column: str.column
        };
    } else if (is(lexims, 'PUNCTUATION', '(')) {
        consume(lexims, 'PUNCTUATION', '(');
        const expression = expr(lexims);
        consume(lexims, 'PUNCTUATION', ')');
        return expression;
    }

    throw `PARSE Error(${lexims[0].line}:${lexims[0].column}): unable to parse factor \`${lexims[0].text}\``;
}

function call_param_list(lexims) {
    const args = [];
    consume(lexims, 'PUNCTUATION', '(');
    if (!is(lexims, null, ')')) {
        do {
            args.push(statement(lexims, false));
        } while (allow(lexims, 'PUNCTUATION', ','));
    }
    consume(lexims, 'PUNCTUATION', ')');
    return args;
}

function number(lexims) {
    const lexim = consume(lexims, 'NUMBER');
    let value = 0;

    switch (lexim.subtype) {
        case 'BINARY': value = Number.parseInt(lexim.text, 2); break;
        case 'OCTAL': value = Number.parseInt(lexim.text, 8); break;
        case 'DECIMAL': value = Number.parseInt(lexim.text, 10); break;
        case 'HEXIDECIMAL': value = Number.parseInt(lexim.text, 16); break;
        default: throw `PARSE Error(${lexim.line}:${lexim.column}): Number format exception \`${lexim.text}\``;
    }

    return {
        type: 'LITERAL',
        subtype: 'NUMERIC',
        value, 
        line: lexim.line,
        column: lexim.column
    };
}

function allow(lexims, type, subtype) {
    if (lexims.length <= 0)
        throw `PARSE Error: unexptected end of stream`;

    if (is(lexims, type, subtype)) {
        lexims.shift();
        return true;
    } else {
        return false;
    }
}

function consume(lexims, type, subtype) {
    if (lexims.length <= 0)
        throw `PARSE Error: unexptected end of stream`;

    if (is(lexims, type, subtype))
        return lexims.shift();
    throw `PARSE Error(${lexims[0].line}:${lexims[0].column}): expected \`${!!type ? type : '?'}.${!!subtype ? subtype : '?'}\` found \`${!!type ? lexims[0].type : '?'}.${!!subtype ? lexims[0].subtype : '?'}\``;
}

function isNext(lexims, type, subtype) {
    return is(lexims.slice(1, 2), type, subtype);
}

function is(lexims, type, subtype) {
    if (lexims.length <= 0)
        return false;

    let isType = true;
    if (Array.isArray(type)) {
        isType = type.includes(lexims[0].type);
    } else if (!!type) {
        isType = type === lexims[0].type;
    }
    
    let isSubT = true;
    if (Array.isArray(subtype)) {
        isSubT = subtype.includes(lexims[0].subtype);
    } else if (!!subtype) {
        isSubT = subtype === lexims[0].subtype;
    }
    
    return isType && isSubT;
}

module.exports = {
    parse: (lexims) => {
        return statement_list(lexims);
    }
};

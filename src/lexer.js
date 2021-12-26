function _(c) {
    return c.charCodeAt(0);
}

function isSpace(c) {
    return c === _(' ')  || c === _('\t')
        || c === _('\r') || c === _('\n');
}

function isBinDigit(c) {
    return c === _('0') || c === _('1');
}

function isOctDigit(c) {
    return c >= _('0') && c <= _('7');
}

function isDecDigit(c) {
    return c >= _('0') && c <= _('9');
}

function isHexDigit(c) {
    return (c >= _('0') && c <= _('9'))
        || (c >= _('a') && c <= _('f'))
        || (c >= _('A') && c <= _('F'));
}

function isAlpha(c) { 
    return (c >= _('a') && c <= _('z'))
        || (c >= _('A') && c <= _('Z'));
}

function isAlNum(c) {
    return isAlpha(c) || isDecDigit(c) || c === _('_');
}

function isOp(c) {
    return '~!%^&*-+=|<>/'.includes(c);
}

function isPunct(c) {
    return '@#$()[]{}\\;:?,.'.includes(c);
}

function getLexim(i, code, checker, type, subtype) {
    subtype = subtype || type;
    let text = '';
    while (i < code.length && checker(code.charCodeAt(i))) {
        text += code.charAt(i++);
    }
    return {
        type,
        subtype,
        text,
        read: text.length
    };
}

function getBin(i, code) {
    return getLexim(i, code, isBinDigit, 'NUMBER', 'BINARY');
}

function getOct(i, code) {
    return getLexim(i, code, isOctDigit, 'NUMBER', 'OCTAL');
}

function getDec(i, code) {
    const int = getLexim(i, code, isDecDigit, 'NUMBER', 'DECIMAL');
    i += int.read;
    if (code.charAt(i) === '.') {
        const frac = getLexim(++i, code, isDecDigit, 'NUMBER', 'DECIMAL');
        return {
            type: 'NUMBER',
            subtype: 'FLOAT',
            text: int.text + '.' + frac.text,
            read: int.read + 1 + frac.read
        };
    }

    return int;
}

function getHex(i, code) {
    return getLexim(i, code, isHexDigit, 'NUMBER', 'HEXIDECIMAL');
}

function getIdentifier(i, code) {
    return getLexim(i, code, isAlNum, 'IDENTIFIER');
}

function getString(i, code, del) {
    const beg = i;
    let text = '';
    ++i;
    while (i < code.length && code.charAt(i) !== del) {
        if (code.charAt(i) === '\\')
            ++i;
        text += code.charAt(i++);
    }
    ++i;
    return {
        type: 'STRING',
        subtype: 'DOUBLE',
        text,
        read: i - beg
    };
}

function getPunct(i, code) {
    return {
        type: 'PUNCTUATION',
        subtype: code.charAt(i),
        text: code.charAt(i),
        read: 1
    };
}

function getOperator(i, code) {
    const beg = i;
    let text = '';
    // let subtype = null;

    text += code.charAt(i);
    ++i;
    switch (text.charAt(0)) {
        case '+':
            // subtype = 'ADD';
            if (code.charAt(i) === '+') {
                ++i;
                text += '+';
                // subtype = 'INC';
            } else if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'ADD_ASSIGN';
            }
            break;
        case '-':
            // subtype = 'SUB';
            if (code.charAt(i) === '-') {
                ++i;
                text += '-';
                // subtype = 'DEC';
            } else if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'SUB_ASSIGN';
            } else if (code.charAt(i) === '>') {
                ++i;
                text += '>';
                // subtype = 'SUB_ASSIGN';
            }
            break;
        case '*':
            // subtype = 'MUL';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'MUL_ASSIGN';
            }
            break;
        case '/':
            // subtype = 'DIV';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'DIV_ASSIGN';
            }
            break;
        case '%':
            // subtype = 'MOD';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'MOD_ASSIGN';
            }
            break;
        case '=':
            // subtype = 'ASSIGN';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'EQ';
            }
            break;
        case '<':
            // subtype = 'LT';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'LE';
            }
            break;
        case '>':
            // subtype = 'GT';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'GE';
            }
            break;
        case '!':
            // subtype = 'LOGICAL_NOT';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'NE';
            }
            break;
        case '~':
            // subtype = 'BITWISE_NOT';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'NOT_ASSIGN';
            }
            break;
        case '&':
            // subtype = 'BITWISE_AND';
            if (code.charAt(i) === '&') {
                ++i;
                text += '&';
                // subtype = 'LOGICAL_AND';
            } else if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'AND_ASSIGN';
            }
            break;
        case '|':
            // subtype = 'BITWISE_OR';
            if (code.charAt(i) === '|') {
                ++i;
                text += '|';
                // subtype = 'LOGICAL_OR';
            } else if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'OR_ASSIGN';
            }
            break;
        case '^':
            // subtype = 'BITWISE_XOR';
            if (code.charAt(i) === '=') {
                ++i;
                text += '=';
                // subtype = 'XOR_ASSIGN';
            }
            break;
        default:
            subtype = 'ERROR';
            break;
    }

    return {
        type: 'OPERATOR',
        subtype: text,
        text,
        read: i - beg
    }
}

module.exports = {
    lex: (code) => {
        let line = 1;
        let col = 1;
        const result = [];

        for (let i = 0; i < code.length;) {
            const column = col;
            let c = code.charAt(i);
            while (i < code.length && isSpace(_(c))) {
                if (c === '\n') {
                    ++line;
                    col = 1;
                }
                c = code.charAt(++i);
                col++;
            }

            if (i >= code.length)
                break;

            if (c === '0') {
                c = code.charAt(++i);
                switch (c) {
                    case 'b': result.push(getBin(++i, code)); break;
                    case 'o': result.push(getOct(++i, code)); break;
                    case 'x': result.push(getHex(++i, code)); break;
                    default:  result.push(getDec(--i, code)); break;
                }
                i += result[result.length-1].read;
                col += result[result.length-1].read;
            } else if (isDecDigit(_(c))) {
                result.push(getDec(i, code));
                i += result[result.length-1].read;
                col += result[result.length-1].read;
            } else if (c === '_' || isAlpha(_(c))) {
                result.push(getIdentifier(i, code));
                i += result[result.length-1].read;
                col += result[result.length-1].read;
            } else if (c === '\"') {
                result.push(getString(i, code, c));
                i += result[result.length-1].read;
                col += result[result.length-1].read;
            } else if (isOp(c)) {
                result.push(getOperator(i, code));
                i += result[result.length-1].read;
                col += result[result.length-1].read;
            } else if (isPunct(c)) {
                result.push(getPunct(i++, code));
                col++;
            } else {
                result.push({
                    type: 'ERROR',
                    subtype: 'ERROR',
                    text: code.charAt(i++),
                    read: 1
                });
                col++;
            }

            result[result.length-1].line = line;
            result[result.length-1].column = column;
        }

        result.push({
            type: 'EOF',
            subtype: 'EOF',
            text: '\0',
            read: 0,
            line,
            column: 0
        });
        return result;
    }
};

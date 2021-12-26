const fs = require('fs');
const ps = require('./src/index');

Object.defineProperty(global, '__stack', {
    get: function() {
            var orig = Error.prepareStackTrace;
            Error.prepareStackTrace = function(_, stack) {
                return stack;
            };
            var err = new Error;
            Error.captureStackTrace(err, arguments.callee);
            var stack = err.stack;
            Error.prepareStackTrace = orig;
            return stack;
        }
    });

Object.defineProperty(global, '__line', {
    get: function() {
            return __stack[1].getLineNumber();
        }
    });

function _(type, subtype, text, line) {
    return { type, subtype, text, line };
}

async function main() {
    lexer_tests();
    parser_tests();
    interpreter_tests();
}

function lexer_tests() {
    console.log('Testing lexer');
    // punctuation
    lex_test('@#$()[]{}\\;:?,.', [
        _('PUNCTUATION', '@',  '@',  __line),
        _('PUNCTUATION', '#',  '#',  __line),
        _('PUNCTUATION', '$',  '$',  __line),
        _('PUNCTUATION', '(',  '(',  __line),
        _('PUNCTUATION', ')',  ')',  __line),
        _('PUNCTUATION', '[',  '[',  __line),
        _('PUNCTUATION', ']',  ']',  __line),
        _('PUNCTUATION', '{',  '{',  __line),
        _('PUNCTUATION', '}',  '}',  __line),
        _('PUNCTUATION', '\\', '\\', __line),
        _('PUNCTUATION', ';',  ';',  __line),
        _('PUNCTUATION', ':',  ':',  __line),
        _('PUNCTUATION', '?',  '?',  __line),
        _('PUNCTUATION', ',',  ',',  __line),
        _('PUNCTUATION', '.',  '.',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    // literals
    lex_test('0b1001 0o12345670 1234567890 0xDEADBEEF 1.23 "\\"Hello, World!\\""', [
        _('NUMBER', 'BINARY',      '1001',            __line),
        _('NUMBER', 'OCTAL',       '12345670',        __line),
        _('NUMBER', 'DECIMAL',     '1234567890',      __line),
        _('NUMBER', 'HEXIDECIMAL', 'DEADBEEF',        __line),
        _('NUMBER', 'FLOAT',       '1.23',            __line),
        _('STRING', 'DOUBLE',      '"Hello, World!"', __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    // operators
    lex_test('a += b+++c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '+=',         '+=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '++',         '++', __line),
        _('OPERATOR',   '+',          '+',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);
        
    lex_test('a -= b---c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '-=',         '-=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '--' ,        '--', __line),
        _('OPERATOR',   '-',          '-',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a *= b*c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '*=',         '*=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '*',          '*',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a /= b/c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '/=',         '/=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '/',          '/',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a %= b%c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '%=',         '%=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '%',          '%',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a = b==c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '=',          '=',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '==',         '==', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a <= b<c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '<=',         '<=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '<',          '<',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a >= b>c', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '>=',         '>=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '>',          '>',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a != !b', [
        _('IDENTIFIER', 'IDENTIFIER',  'a',  __line),
        _('OPERATOR',   '!=',          '!=', __line),
        _('OPERATOR',   '!',           '!',  __line),
        _('IDENTIFIER', 'IDENTIFIER',  'b',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a ~= ~b', [
        _('IDENTIFIER', 'IDENTIFIER',  'a',  __line),
        _('OPERATOR',   '~=',          '~=', __line),
        _('OPERATOR',   '~',           '~',  __line),
        _('IDENTIFIER', 'IDENTIFIER',  'b',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a &= b&c&&d', [
        _('IDENTIFIER', 'IDENTIFIER',  'a',  __line),
        _('OPERATOR',   '&=',          '&=', __line),
        _('IDENTIFIER', 'IDENTIFIER',  'b',  __line),
        _('OPERATOR',   '&',           '&',  __line),
        _('IDENTIFIER', 'IDENTIFIER',  'c',  __line),
        _('OPERATOR',   '&&',          '&&', __line),
        _('IDENTIFIER', 'IDENTIFIER',  'd',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a |= b|c||d', [
        _('IDENTIFIER', 'IDENTIFIER', 'a',  __line),
        _('OPERATOR',   '|=',         '|=', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'b',  __line),
        _('OPERATOR',   '|',          '|',  __line),
        _('IDENTIFIER', 'IDENTIFIER', 'c',  __line),
        _('OPERATOR',   '||',         '||', __line),
        _('IDENTIFIER', 'IDENTIFIER', 'd',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);

    lex_test('a ^= b^c', [
        _('IDENTIFIER', 'IDENTIFIER',  'a',  __line),
        _('OPERATOR',   '^=',          '^=', __line),
        _('IDENTIFIER', 'IDENTIFIER',  'b',  __line),
        _('OPERATOR',   '^',           '^',  __line),
        _('IDENTIFIER', 'IDENTIFIER',  'c',  __line),
        _('EOF', 'EOF',  '\0',  __line) ]);
}

function lex_test(code, expected) {
    const lexims = ps.lexer.lex(code);

    console.assert(!(lexims.length > expected.length), `LENGTH(${expected[0].line}) expected more tokens`);
    console.assert(!(lexims.length < expected.length), `LENGTH(${expected[0].line}) expected fewer tokens`);
    if (lexims.length === expected.length) {
        for (let i = 0; i < lexims.length; ++i) {
            console.assert(lexims[i].type === expected[i].type, `TYPE(${expected[i].line}) expected ${expected[i].type} found ${lexims[i].type}`);
            console.assert(lexims[i].subtype === expected[i].subtype, `SUBTYPE(${expected[i].line}) expected ${expected[i].subtype} found ${lexims[i].subtype}`);
            console.assert(lexims[i].text === expected[i].text, `TEXT(${expected[i].line}) expected ${expected[i].text} found ${lexims[i].text}`);
        }
    }
}

function parser_tests() {
    console.log('Testing parser');

    parse_test('1;', false, __line);

    parse_test('1+2;',   false, __line);
    parse_test('1*2;',   false, __line);
    parse_test('1+2*3;', false, __line);
    parse_test('1-2;',   false, __line);
    parse_test('1/2;',   false, __line);
    parse_test('1-2/3;', false, __line);
    parse_test('7 % 2;', false, __line);
    parse_test('(1-2+3)/4;',   false, __line);
    parse_test('((1-2)+3)/4;', false, __line);
    parse_test('a = "Hello, "; a += "World!";', false, __line);

    parse_test('7 > 2;',  false, __line);
    parse_test('7 < 2;',  false, __line);
    parse_test('7 <= 2;', false, __line);
    parse_test('7 >= 2;', false, __line);
    parse_test('7 == 2;', false, __line);
    parse_test('7 && 2;', false, __line);
    parse_test('7 || 2;', false, __line);

    parse_test('a = 1-2/3; a+=2; a;', false, __line);
    parse_test('a = 1-2/3; a-=2; a;', false, __line);
    parse_test('a = 1-2/3; a*=2; a;', false, __line);
    parse_test('a = 1-2/3; a/=2; a;', false, __line);
    
    
    parse_test('test = (arg1, arg2) -> { arg1 + arg2; }; test(5, 9);', false, __line);
    parse_test('echo("Hello, World!");', false, __line);
    parse_test('test = (arg1) -> { echo(arg1); }; test("Hello, World!");', false, __line);
    parse_test(`
        test = (arg1) -> {
            arg1() + 1;
        };
        test(() -> {
            100;
        });
        `, false, __line);

    parse_test('1 && 0 ? 100 : 99;', false, __line);
    parse_test('1 || 1 ? 100 : 99;', false, __line);
    parse_test('a = 1 || 1 ? 100 : 99; a;', false, __line);
    // parse_test('a = (1 || 1 ? 100 : 99); a;', false, __line);
    // parse_test('1 ? a=100 : a=99; a;', false, __line);
    // parse_test('0 ? a=100 : a=99; a;', false, __line);
    parse_test('a = builtin1() ? builtin1() : builtin2(); a;', false, __line);
    parse_test('a = builtin2() ? builtin1() : builtin2(); a;', false, __line);
    parse_test('a = builtin2() ? builtin1() : builtin2(); a;', false, __line);
}

function parse_test(code, expected, line) {
    try {
        ps.parse(code);
    } catch (err) {
        console.assert(!!expected, `(${line}) ${err}`);
    }
}

function interpreter_tests() {
    console.log('Testing interpreter');

    interpret_test('1;',     1,     __line);
    interpret_test('1+2;',   1+2,   __line);
    interpret_test('1*2;',   1*2,   __line);
    interpret_test('1+2*3;', 1+2*3, __line);
    interpret_test('1-2;',   1-2,   __line);
    interpret_test('1/2;',   1/2,   __line);
    interpret_test('1-2/3;', 1-2/3, __line);
    interpret_test('7 % 2;', 1,     __line);
    interpret_test('(1-2+3)/4;', (1-(2+3))/4, __line);
    interpret_test('((1-2)+3)/4;', ((1-2)+3)/4, __line);
    interpret_test('a = "Hello, "; a += "World!";', 'Hello, World!', __line);

    interpret_test('7 > 2;',  7 > 2,  __line);
    interpret_test('7 < 2;',  7 < 2,  __line);
    interpret_test('7 <= 2;', 7 <= 2, __line);
    interpret_test('7 >= 2;', 7 >= 2, __line);
    interpret_test('7 == 2;', 7 === 2, __line);
    interpret_test('7 != 2;', 7 !== 2, __line);
    interpret_test('7 && 2;', !!(7 && 2), __line);
    interpret_test('7 || 2;', !!(7 || 2), __line);
    interpret_test('2+7 > 10+1;', 2+7 > 10+1, __line);

    interpret_test('a = 1-2/3; a+=2; a;', (1-2/3)+2, __line);
    interpret_test('a = 1-2/3; a-=2; a;', (1-2/3)-2, __line);
    interpret_test('a = 1-2/3; a*=2; a;', (1-2/3)*2, __line);
    interpret_test('a = 1-2/3; a/=2; a;', (1-2/3)/2, __line);
    
    interpret_test('test = (arg1, arg2) -> { arg1 + arg2; }; test(5, 9);', 5+9, __line);
    interpret_test('builtin("Hello, World!");', -1, __line, { 'builtin(1)': (arg) => -1 });
    interpret_test('test = (arg1) -> { builtin(arg1); }; test("Hello, World!");', -1, __line, { 'builtin(1)': (arg) => -1 });
    interpret_test(`
        test = (arg1) -> {
            arg1() + 1;
        };
        test(() -> {
            100;
        });
        `, 101, __line);

    interpret_test('1 && 0 ? 100 : 99;', !!(1 && 0) ? 100 : 99, __line);
    interpret_test('1 || 1 ? 100 : 99;', !!(1 || 1) ? 100 : 99, __line);
    interpret_test('a = 1 || 1 ? 100 : 99; a;', !!(1 || 1) ? 100 : 99, __line);
    // interpret_test('a = (1 || 1 ? 100 : 99); a;', !!(1 || 1) ? 100 : 99, __line);
    // interpret_test('1 ? a=100 : a=99; a;', 100, __line);
    // interpret_test('0 ? a=100 : a=99; a;', 99,  __line);
    interpret_test('a = builtin1() ? builtin1() : builtin2(); a;', !!100 ? 100 : 0, __line, {
        'builtin1(0)': () => 100,
        'builtin2(0)': () => 0
    });
    interpret_test('a = builtin2() ? builtin1() : builtin2(); a;', !!0 ? 100 : 0, __line, {
        'builtin1(0)': () => 100,
        'builtin2(0)': () => 0
    });

    fs.promises.readFile('test.ps')
        .then(code => {
            interpret_test(code.toString(), 34, __line, {
                'input(0)': () => 9
            });
        })
        .catch(err => {
            console.error('TEST Error: ', err);
        });
}

function interpret_test(code, expected, line, context={}, scope={}) {
    const result = ps.interpret(code, context, scope);

    if (typeof result === 'string') {
        console.assert(result === expected,
            `(${line}) expected \`${expected}\` found \`${result}\``);
    } else {
        console.assert(Math.abs(result - expected) <= Number.EPSILON,
            `(${line}) expected \`${expected}\` found \`${result}\``);
    }
}

main();

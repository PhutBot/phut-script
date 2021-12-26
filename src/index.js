const lexer = require('./lexer');
const parser = require('./parser');
const interpreter = require('./interpreter');

module.exports = {
    lexer,
    lex: lexer.lex,
    parser,
    parse: (code) => parser.parse(lexer.lex(code)),
    interpreter,
    interpret: interpreter.interpret
};

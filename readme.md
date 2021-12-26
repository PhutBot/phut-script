```
<def_param_list> ::= () | ( <id_list> )
<func>           ::= <def_param_list> -> <block>

<block> ::= { <statement_list> }

<statement_list>  ::= <statement>; | <statement>; <statement_list>
<call_param_list> ::= <statement> | <statement>, <call_param_list>
<statement>       ::= <expr> | <func> | <statement_assign> | <statement_assign_add> | <statement_assign_sub> | <statement_assign_mul> | <statement_assign_div> | <statement_ternary>

<statement_assign>     ::= <identifier> = <statement>
<statement_ternary>    ::= <expr> ? <statement> : <statement>
<statement_assign_add> ::= <identifier> += <expr>
<statement_assign_sub> ::= <identifier> -= <expr>
<statement_assign_mul> ::= <identifier> *= <expr>
<statement_assign_div> ::= <identifier> /= <expr>

<expr> ::= <non_logical_expr> <logical_op> <non_logical_expr>
<non_logical_expr> ::= <term> | <term> <add_sub> <non_logical_expr>
<term>      ::= <factor> | <factor> <mul_div> <term>
<factor>    ::= <number> | <identifier> | ( <expr> ) | <call>
<call>      ::= <identifier>(<call_param_list>)

<id_list>    ::= <identifier> | <identifier>, <id_list>
<identifier> ::= <id_beg> <id_seq>
<id_seq>     ::= <id_char> | <id_char> <id_seq>
<id_char>    ::= _ | <letter> | <dec_digit>
<id_beg>     ::= _ | <letter>

<number>  ::= <dec_num> | <hex_num> | <oct_num> | <bin_num>
<dec_num> ::= <dec_seq>
<hex_num> ::= 0x<hex_seq>
<oct_num> ::= 0o<oct_seq>
<bin_num> ::= 0b<bin_seq>

<hex_seq> ::= <hex_digit> | <hex_digit> <hex_seq>
<dec_seq> ::= <dec_digit> | <dec_digit> <dec_seq>
<oct_seq> ::= <oct_digit> | <oct_digit> <oct_seq>
<bin_seq> ::= <bin_digit> | <bin_digit> <bin_seq>

<hex_digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | a | b | c | d | e | f | A | B | C | D | E | F
<dec_digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
<oct_digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
<bin_digit> ::= 0 | 1

<letter> ::= a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z

<logical_op> ::= < | > | <= | >= | == | != | && | \|\|
<add_sub> ::= + | -
<mul_div> ::= * | / | %
```

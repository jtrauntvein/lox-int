const token_types = {
   UNKNOWN: -1,
   LEFT_PAREN: 0,
   RIGHT_PAREN: 1,
   LEFT_BRACE: 2,
   RIGHT_BRACE: 3,
   COMMA: 4,
   DOT: 5,
   MINUS: 6,
   PLUS: 7,
   SEMICOLON: 8,
   SLASH: 9,
   STAR: 10,

   BANG: 11,
   BANG_EQUAL: 12,
   EQUAL: 13,
   DOUBLE_EQUAL: 14,
   GREATER: 15,
   GREATER_EQUAL: 16,
   LESS: 17,
   LESS_EQUAL: 18,
   IDENTIFIER: 19,
   STRING: 20,
   NUMBER: 21,
   EQUAL_EQUAL: 39,

   AND: 22,
   CLASS: 23,
   ELSE: 24,
   FALSE: 25,
   FUN: 26,
   FOR: 27,
   IF: 28,
   NIL: 29,
   OR: 30,
   PRINT: 31,
   RETURN: 32,
   SUPER: 33,
   THIS: 34,
   TRUE: 35,
   VAR: 36,
   WHILE: 37,
   EOF: 38      
};
Object.freeze(token_types);


class Token {
   /**
    * Enumerates the possible types of tokens in the language
    */
   static token_types = token_types;

   /**
    * Identifies the token type code for this token
    */
   token_type;

   /**
    * Specifies the lexeme string
    */
   lexeme;

   /**
    * Specifies the literal 
    */
   literal;

   /**
    * Specifies the source line where the token was found
    */
   line;

   /**
    * @param {number} token_type Code that identifies the type of token
    * @param {string} lexeme
    * @param {object} literal 
    * @param {number} line Specifies the source line for the token
    */
   constructor(token_type, lexeme, literal, line) {
      this.token_type = token_type;
      this.lexeme = lexeme;
      this.literal = literal;
      this.line = line;
   }

   /**
    * @return formats the token to a string.
    */
   toString() {
      return `${this.token_type}, ${this.lexeme}, ${JSON.stringify(this.literal)}`;
   }
}

export default Token;
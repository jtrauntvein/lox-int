import Token from "./token.js";
import lox_error from "./lox-error.js";

/**
 * 
 * @param {string} ch Specifies a character to determin
 * @returns {boolean} Returns true if the character is in the range of 0-9
 */
function is_digit(ch) {
   return (ch >= '0' && ch <= '9');
}

/**
 * @return {boolean} Returns true if the given character is an alpha character or alphanumeric
 * @param {string} ch Specifies the character to test
 * @param {boolean=false} check_number Set to true if the check for a numeric should also be used
 */
function is_alpha(ch, check_number = false) {
   let rtn = ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'z') || ch === '_');
   if(!rtn && check_number)
      rtn = is_digit(ch);
   return rtn;
}

/**
 * Specifies a mapping of reserved identifiers.  These are keyed by the identifier name and the value is the token type.
 */
const reserved_words = {
   "and": Token.token_types.AND,
   "or": Token.token_types.OR,
   "if": Token.token_types.IF,
   "for": Token.token_types.FOR,
   "while": Token.token_types.WHILE,
   "else": Token.token_types.ELSE,
   "class": Token.token_types.CLASS,
   "nil": Token.token_types.NIL,
   "fun": Token.token_types.FUN,
   "true": Token.token_types.TRUE,
   "false": Token.token_types.FALSE,
   "print": Token.token_types.PRINT,
   "return": Token.token_types.RETURN,
   "super": Token.token_types.SUPER,
   "this": Token.token_types.THIS,
   "var": Token.token_types.VAR
};
Object.freeze(reserved_words);

/**
 * Defines the object that is responsible far scanning input and breaking it down into tokens
 */
class Scanner {
   /**
    * Specifies the search string broken down into a character array
    */
   #source = [];

   /**
    * Specifies the list of tokens that were scanned
    */
   #tokens = [];

   /**
    * Specifies the starting location for the token currently being parsed
    */
   #start = 0;

   /**
    * Specifies the current scanner offset
    */
   #current = 0;

   /**
    * Specifies the line number.
    */
   #line = 1;

   /**
    * Constructor
    * 
    * @param {string | string[]} source Specifies the source to be scanned.  Internally, this will be split into an array of
    * single character strings.  The application can provide this as a string[]
    */
   constructor(source) {
      if(Array.isArray(source))
         this.#source = [ ... source ];
      else
         this.#source = source.split("");
   }

   /**
    * @return {boolean} Returns true if the entire source has been parsed
    */
   is_at_end() {
      return(this.#current >= this.#source.length);
   }

   /**
    * @return {Token[]} Returns the list of parsed tokens
    */
   scan_tokens() {
      while(!this.is_at_end()) {
         this.#start = this.#current;
         this.#scan_token()
      }
      return this.#tokens;
   }

   /**
    * Scans the source for the next token
    */
   #scan_token() {
      const ch = this.#advance();
      switch(ch) {
      case '(':
         this.#add_token(Token.token_types.LEFT_PAREN);
         break;

      case ')':
         this.#add_token(Token.token_types.RIGHT_PAREN);
         break;

      case '{':
         this.#add_token(Token.token_types.LEFT_BRACE);
         break;

      case '}':
         this.#add_token(Token.token_types.RIGHT_BRACE);
         break;

      case ',':
         this.#add_token(Token.token_types.COMMA);
         break;

      case '.':
         this.#add_token(Token.token_types.DOT);
         break;

      case '-':
         this.#add_token(Token.token_types.MINUS);
         break;

      case '+':
         this.#add_token(Token.token_types.PLUS);
         break;

      case ';':
         this.#add_token(Token.token_types.SEMICOLON);
         break;

      case '*':
         this.#add_token(Token.token_types.STAR);
         break;

      case '!':
         this.#add_token(this.#match('=') ? Token.token_types.BANG_EQUAL : Token.token_types.BANG);
         break;

      case '=':
         this.#add_token(this.#match('=') ? Token.token_types.EQUAL_EQUAL : Token.token_types.EQUAL);
         break;

      case '<':
         this.#add_token(this.#match('=') ? Token.token_types.LESS_EQUAL : Token.token_types.LESS);
         break;

      case '>':
         this.#add_token(this.#match('=') ? Token.token_types.GREATER_EQUAL : Token.token_types.GREATER);
         break;

      case '/':
         if(this.#match('/')) {
            while(this.#peek() !== '\n' &&!this.is_at_end())
               this.#advance();
         }
         break;

      case '\r':
      case ' ':
      case '\t':
         break; // ignore whitespace
         
      case '\n':
         ++this.#line; // advance the line but otherwise ignore line feed
         break;

      case '"':
         this.#string();
         break;

      default:
         if(is_digit(ch))
            this.#number(ch);
         else if(is_alpha(ch))
            this.#identifier();
         else
            lox_error(this.#line, `Unexpected character '${ch}`);
         break;
      }
   }

   /**
    * @return {string} Returns the character at the current position and advances the current position by one.
    */
   #advance() {
      return this.#source[this.#current++];
   }

   /**
    * Adds a new token to the set managed by this object
    * @param {number} type Specifies the code for the token type
    * @param {object={}} literal Specifies the literal structure for the token
    */
   #add_token(type, literal = {}) {
      const text = this.#source.slice(this.#start, this.#current).join("");
      this.#tokens.push(new Token(type, text, literal, this.#line));
   }

   /**
    * Peeks ahead in the buffer to see if the next character matches the expected value.  If the match works,
    * the buffer pointer will be advanced.
    * 
    * @param {string} expected Specifies the character that may follow
    * @returns {boolean} Returns true if the next character matched the expected character.
    */
   #match(expected) {
      let rtn = false;
      if(!this.is_at_end()) {
         if(this.#source[this.#current] === expected) {
            rtn = true;
            ++this.#current;
         }
      }
      return rtn;
   }

   /**
    * @return {string}  Looks ahead to the next character and returns that character but does not affect internal state.
    */
   #peek() {
      let rtn = '';
      if(!this.is_at_end())
         rtn = this.#source[this.#current];
      return rtn;
   }

   /**
    * Scans from the current location to the end of the string.
    */
   #string() {
      while(!this.is_at_end() && this.#peek() !== '"') {
         if(this.#peek() === '\n')
            ++this.#line;
         this.#advance();
      }
      if(this.#current > this.#start) {
         const value = this.#source.slice(this.#start + 1, this.#current).join("");
         this.#advance(); 
         this.#add_token(Token.token_types.STRING, value);
      }
      else
         lox_error(this.#line, "unterminated string.");
   }

   /**
    * Scans from the current location to the end of the number
    */
   #number() {
      const state_type = {
         state_before_sign: 0,
         state_before_decimal: 1,
         state_after_decimal: 2,
         state_before_exp_sign: 3,
         state_in_exp: 4,
         state_at_end: 5,
         state_failure: 6
      };
      let state = state_type.state_before_sign;
      while(!this.is_at_end() && state !== state_type.state_at_end) {
         const ch = this.#peek();
         if(state === state_type.state_before_sign) {
            if(ch === '+' || ch == '-') {
               state = state_type.state_before_decimal;
               this.#advance();
            }
            else if(is_digit(ch)) {
               state = state_type.state_before_decimal;
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else if(ch == '.') {
               state = state_type.state_after_decimal;
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else
               state = state_type.state_failure;
         }
         else if(state == state_type.state_before_decimal) {
            if(is_digit(ch)) {
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else if(ch === '.') {
               state = state_type.state_after_decimal;
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else 
               state = state_type.state_at_end;
         }
         else if(state === state_type.state_after_decimal) {
            if(is_digit(ch)) {
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else if(ch === 'e' || ch === 'E') {
               this.#advance();
               state = state_type.state_before_exp_sign;
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else 
               state = state_type.state_at_end;
         }
         else if(state === state_type.state_before_exp_sign) {
            if((ch === '-' || ch ==='+') || is_digit(ch)) {
               state = state_type.state_in_exp;
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else
               state = state_type.state_at_end;
         }
         else if(state === state_type.state_in_exp) {
            if(is_digit(ch)) {
               this.#advance();
               if(this.is_at_end())
                  state = state_type.state_at_end;
            }
            else 
               state = state_type.state_at_end;
         }
      }
      if(state === state_type.state_at_end) {
         const value_ary = this.#source.slice(this.#start, this.#current);
         const value_str = value_ary.join("");
         this.#add_token(Token.token_types.NUMBER, Number.parseFloat(value_str));
      }
      else
         lox_error(this.#line, "invalid number format");
   }

   /**
    * Responsible for parsing a reserved word or a program variable token name
    */
   #identifier() {
      // scan for the end of the identifier sequence
      while(is_alpha(this.#peek(), true))
         this.#advance();

      // this identifier may be a user defined name or it may be a reserved word.  If it is not reserved, than it will be 
      // treated as a user defined name.
      const name = this.#source.slice(this.#start, this.#current).join("");
      const reserved_token = reserved_words[name];
      const token_type = (reserved_token ?? Token.token_types.IDENTIFIER);
      this.#add_token(token_type);
   }
}

export default Scanner;

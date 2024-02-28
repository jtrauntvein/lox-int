import process from "node:process";
import readline from "node:readline";
import fs from "node:fs";
import lox_error from "./lox-error.js";
import Scanner from "./scanner.js";


class Lox {
   /**
    * constructor
    */
   constructor() 
   { }

   /**
    * Executes the lox interpeter on the given source
    * 
    * @param {string} source Specifies the source string
    */
   async run(source) {
      const scanner = new Scanner(source);
      const tokens = scanner.scan_tokens();
      tokens.forEach((token) => {
         console.log(token.toString());
      });
   }

   /**
    * Executes the code given by the named file.
    * @param {string} file_name Specifies the path to the input file.
    */
   async run_from_file(file_name) {
      const input = await fs.promises.readFile(file_name);
      await this.run(input);
   }

   async run_from_prompt() {
      const ri = readline.createInterface({ input: process.stdin, output:  process.stdout });
      let at_end = false;
      const prompt = async () => {
         return new Promise((accept) => {
            ri.question("> ", (line) => {
               accept(line);
            });
         });
      };
      while(!at_end) {
         const line = await prompt();
         if(line === "exit")
            at_end = true;
         else
            this.run(line);
      }
   }
}


async function main(argv) {
   let rtn = 0;
   try {
      const lox = new Lox();
      if(argv.length === 2)
         await lox.run_from_prompt();
      else if(argv.length === 3)
         await lox.run_from_file(argv[2]);
      else
      {
         console.error(`usage: lox [ lox-script ]`);
         process.exit(0);
      }
      lox_error.on("lox-error", (line, message) => {
         console.error(`compile error on line ${line}: ${message}`);
         rtn = 1;
      });
   }
   catch(error)
   {
      console.error(`exiting: ${error}`);
      process.exit(1);
   }
   process.exit(rtn);
}

main(process.argv);

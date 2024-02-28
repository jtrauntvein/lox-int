import events from "node:events";
const emitter = new events.EventEmitter();

/**
 * Emits an error event for the source line and message
 * @param {number} line Specifies the line that contains the error
 * @param {string} message Specifies the message that describes the error
 */
export default async function lox_error(line, message) {
   await emitter.emit("lox-error", line, message);
}

/**
 * Registers an event handler for Lox errors.  Lox errors are identified by the event type 'lox-error' and the 
 * parameters for the callback can include a line number and a message.
 * @param  {...any} args 
 */
lox_error.on = function(...args) {
   emitter.on(...args);
}


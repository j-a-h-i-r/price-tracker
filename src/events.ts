import { EventEmitter } from "events";
import logger from "./core/logger";

class ParseEvent {
    private readonly eventName = "parse-done";
    event: EventEmitter;
    constructor() {
        this.event = new EventEmitter();    
    }

    notify() {
        logger.info("Notify called");
        this.event.emit(this.eventName);
    }

    subscribe(fn: (...args: any[]) => void) {
        this.event.on(this.eventName, fn);
    }
}

const parseEvent = new ParseEvent();

export { parseEvent }

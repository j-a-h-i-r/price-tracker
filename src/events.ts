import { EventEmitter } from "events";

class ParseEvent {
    private readonly eventName = "parse-done";
    event: EventEmitter;
    constructor() {
        this.event = new EventEmitter();    
    }

    notify() {
        console.log("Notify called");
        this.event.emit(this.eventName);
    }

    subscribe(fn: (...args: any[]) => void) {
        this.event.on(this.eventName, fn);
    }
}

const parseEvent = new ParseEvent();

export { parseEvent }

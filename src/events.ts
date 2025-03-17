import { EventEmitter } from 'events';
import logger from './core/logger';

class BaseEvent {
    event: EventEmitter;
    constructor(protected readonly eventName: string) {
        this.event = new EventEmitter();    
    }

    notify(...args: any[]) {
        this.event.emit(this.eventName, ...args);
    }

    subscribe(fn: (...args: any[]) => void) {
        this.event.on(this.eventName, (...args: any[]) => {
            setImmediate(() => fn(...args));
        });
    }

    unsubscribe() {
        this.event.removeAllListeners(this.eventName);
    }
}

class ParseEvent extends BaseEvent {
    constructor() {
        super('parse-done');
    }
}

class QueueEvent extends BaseEvent {
    constructor() {
        super('queue-job');
    }
}

const parseEvent = new ParseEvent();
const queueEvent = new QueueEvent();
export { parseEvent, queueEvent };

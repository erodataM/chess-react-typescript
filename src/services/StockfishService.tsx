export default class StockfishService {
    worker: Worker = new Worker('../../stockfish.wasm.js');

    constructor() {
    }

    attachListener(listener: (e: MessageEvent) => any): void {
        this.worker.addEventListener('message', listener);
    }

    postMessage(message: string): void {
        this.worker.postMessage(message);
    }
}
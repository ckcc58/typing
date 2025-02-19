export class Tick {
    static on(callback: Function) {
        const repeat = () => {
            requestAnimationFrame(() => {
                let done = callback();
                if (done) {
                    repeat();
                } else {
                    console.log("end")
                }
            });
        }

        repeat();
    }
}
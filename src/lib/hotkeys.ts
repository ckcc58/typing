import { volume } from "../store.ts";

export function addKeyHandler(){
    document.addEventListener("keydown", handleKeydown);
}

function handleKeydown(e: KeyboardEvent){
    switch (e.key) {
        case "ArrowUp":
            e.preventDefault();
            if (e.ctrlKey) {
                volume.update(current => Math.min(100, current + 1));
            } else {
                volume.update(current => Math.min(100, current + 10));
            }
            break;
        case "ArrowDown":
            e.preventDefault();
            if (e.ctrlKey) {
                volume.update(current => Math.max(0, current - 1));
            } else {
                volume.update(current => Math.max(0, current - 10));
            }
            break;
    }
}
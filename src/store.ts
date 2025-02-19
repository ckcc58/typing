import { writable } from "svelte/store";

export let volume = writable<number>(50);
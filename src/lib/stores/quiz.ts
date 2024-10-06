import { writable } from "svelte/store";

export const quizStore = writable<string[]>([]);

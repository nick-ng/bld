import { writable } from "svelte/store";
import { browser } from "$app/environment";
import {
	CURRENT_QUIZ_LETTER_PAIRS_STORE_KEY,
	CURRENT_QUIZ_AGE_STORE_KEY,
	CURRENT_QUIZ_TYPE_STORE_KEY
} from "$lib/constants";

export const quizStore = writable<string[]>([]);
export const quizTypeStore = writable<string>("normal");

export const touchCurrentQuiz = () => {
	localStorage.setItem(CURRENT_QUIZ_AGE_STORE_KEY, Date.now().toString());
};

const MAX_QUIZ_AGE_MS = 1000 * 60 * 60; // 1 hour
const loadQuiz = () => {
	try {
		const lastQuizMsString = localStorage.getItem(CURRENT_QUIZ_AGE_STORE_KEY);
		if (!lastQuizMsString) {
			return;
		}

		const lastQuizMs = parseInt(lastQuizMsString, 10);
		if (Date.now() - lastQuizMs > MAX_QUIZ_AGE_MS) {
			return;
		}

		const quizString = localStorage.getItem(CURRENT_QUIZ_LETTER_PAIRS_STORE_KEY);
		if (!quizString) {
			return;
		}

		const quizLetters = JSON.parse(quizString);
		quizStore.set(quizLetters);
	} catch (err) {
		console.error("error when retrieving quiz", err);
	}

	try {
		quizTypeStore.set(localStorage.getItem(CURRENT_QUIZ_TYPE_STORE_KEY) || "normal");
	} catch (err) {
		console.error("error when retrieving quiz type", err);
	}
};

if (browser) {
	loadQuiz();

	quizStore.subscribe((newQuiz) => {
		localStorage.setItem(CURRENT_QUIZ_LETTER_PAIRS_STORE_KEY, JSON.stringify(newQuiz));
	});

	quizTypeStore.subscribe((newQuizType) => {
		localStorage.setItem(CURRENT_QUIZ_TYPE_STORE_KEY, newQuizType);
	});
}

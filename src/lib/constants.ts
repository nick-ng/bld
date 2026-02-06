export const USERNAME_STORE_KEY = "PUX_BLD_USERNAME";
export const PASSWORD_STORE_KEY = "PUX_BLD_PASSWORD";
export const ACCESS_TOKEN_STORE_KEY = "PUX_BLD_ACCESS_TOKEN";
export const IS_GUEST_STORE_KEY = "PUX_BLD_IS_GUEST";
export const FIXED_QUIZ_STORE_KEY = "PUX_FIXED_QUIZ";
export const FLASH_CARD_FILTER_STORE_KEY = "PUX_BLD_FLASH_CARD_FILTER";
export const OPTIONS_LOCAL_STORAGE_KEY = "PUX_BLD_OPTIONS";
export const QUIZ_OLDEST_STORE_KEY = "PUX_BLD_QUIZ_OLDEST";
export const QUIZ_MEMO_CONFIDENCE_STORE_KEY = "PUX_BLD_QUIZ_MEMO_CONFIDENCE";
export const QUIZ_COMM_CONFIDENCE_STORE_KEY = "PUX_BLD_QUIZ_COMM_CONFIDENCE";
export const QUIZ_RANDOM_STORE_KEY = "PUX_BLD_QUIZ_RANDOM";
export const DRILL_INFO_STORE_KEY = "PUX_BLD_DRILL_INFO";
export const DRILL_ITEMS_STORE_KEY = "PUX_BLD_DRILL_ITEMS";
export const CURRENT_QUIZ_LETTER_PAIRS_STORE_KEY = "PUX_BLD_CURRENT_QUIZ_LETTER_PAIRS";
export const CURRENT_QUIZ_AGE_STORE_KEY = "PUX_BLD_CURRENT_QUIZ_AGE";
export const CURRENT_QUIZ_TYPE_STORE_KEY = "PUX_BLD_CURRENT_QUIZ_TYPE";
export const OPTIONS_STORE_PREFIX = "PUX_OPTIONS";
export const MBLD_STORE_KEY = "PUX_MBLD";

export const EDGE_POSITIONS = [
	"UB",
	"UL",
	"UR",
	"UF",
	"LU",
	"LB",
	"LF",
	"LD",
	"FU",
	"FL",
	"FR",
	"FD",
	"RU",
	"RF",
	"RB",
	"RD",
	"BU",
	"BR",
	"BL",
	"BD",
	"DF",
	"DL",
	"DR",
	"DB",
];

export const CORNER_POSITIONS = [
	"UBL",
	"UBR",
	"UFL",
	"UFR",
	"LUB",
	"LUF",
	"LDB",
	"LDF",
	"FUL",
	"FUR",
	"FDL",
	"FDR",
	"RUF",
	"RUB",
	"RDF",
	"RDB",
	"BUR",
	"BUL",
	"BDR",
	"BDL",
	"DFL",
	"DFR",
	"DBL",
	"DBR",
];

export const SPEFFZ_LETTERS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
];

export const SPEFFZ_CORNER_UBL = ["a", "e", "r"];
export const SPEFFZ_CORNER_UFR = ["c", "j", "m"];
export const SPEFFZ_CORNER_SAME_PIECES = [
	SPEFFZ_CORNER_UBL,
	["b", "n", "q"],
	SPEFFZ_CORNER_UFR,
	["d", "f", "i"],
	["g", "l", "u"],
	["h", "s", "x"],
	["k", "p", "v"],
	["o", "t", "w"],
];

export const SPEFFZ_EDGE_DF = ["u", "k"];
export const SPEFFZ_EDGE_UF = ["c", "i"];
export const SPEFFZ_EDGE_SAME_PIECES = [
	["a", "q"], // UB
	["b", "m"], // UR
	SPEFFZ_EDGE_UF,
	["d", "e"], // UL
	["f", "l"], // LF
	["g", "x"], // LD
	["h", "r"], // LB
	["j", "p"], // FR
	SPEFFZ_EDGE_DF,
	["n", "t"], // RB
	["o", "v"], // RD
	["s", "w"], // BD
];

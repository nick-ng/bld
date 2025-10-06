-- create flash_card table
CREATE TABLE flash_card (
	owner TEXT,
	type TEXT,
	letter_pair TEXT,
	memo TEXT,
	image TEXT,
	commutator TEXT,
	tags TEXT,
	last_quiz_unix INTEGER,
	last_drill_unix INTEGER,
	memo_confidence INTEGER,
	comm_confidence INTEGER,
	drill_time_ms INTEGER,
	is_public INTEGER
);

-- split

CREATE INDEX owner_type_letterpair ON flash_card (
owner,
type,
letter_pair);

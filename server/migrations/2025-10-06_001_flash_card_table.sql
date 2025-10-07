-- create flash_card table
CREATE TABLE flash_card (
	owner TEXT NOT NULL,
	type TEXT NOT NULL,
	letter_pair TEXT NOT NULL,
	memo TEXT DEFAULT '',
	image TEXT DEFAULT '',
	commutator TEXT DEFAULT '',
	tags TEXT DEFAULT '',
	last_quiz_unix INTEGER DEFAULT 0,
	last_drill_unix INTEGER DEFAULT 0,
	memo_confidence INTEGER DEFAULT 0,
	comm_confidence INTEGER DEFAULT 0,
	drill_time_ms INTEGER DEFAULT 50000,
	is_public INTEGER DEFAULT 0,
	is_deleted INTEGER DEFAULT 0,
	modified_at INTEGER DEFAULT (unixepoch()),
	UNIQUE (owner, type, letter_pair) ON CONFLICT IGNORE
)
;

-- split

CREATE INDEX owner_type_letterpair ON flash_card (
	owner,
	type,
	letter_pair
);

-- split

CREATE TRIGGER update_flash_card_modified_at AFTER UPDATE ON flash_card
BEGIN
	UPDATE flash_card
	SET modified_at = unixepoch()
	WHERE rowid = NEW.rowid;
END

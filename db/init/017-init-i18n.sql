CREATE TABLE
   translations (
      id VARCHAR(40) NOT NULL,
      label TEXT NOT NULL,
      language TEXT NOT NULL,
      value TEXT NOT NULL
   );

ALTER TABLE translations ADD CONSTRAINT translations_pk PRIMARY KEY (id);

CREATE UNIQUE INDEX translations_label_language_idx ON translations (label, language);
url: 127.0.0.1:3000

Install node modules - npm i

nodemon index.js to start server

Postgresql - port 5432

Crime Writers database is crimewriters.txt - Import into table books

SQL Commands

--------------- Tables ------------

Create TABLE books (
    id serial primary key,
    writer varchar(30) NOT NULL UNIQUE,
    born char(4) NOT NULL,
    alive varchar(4) NOT NULL,
    country varchar(20)
);

Create TABLE countrylist (
    id serial primary key,
    country varchar(20) NOT NULL UNIQUE,
    writer integer NOT NULL
);

Note: Populate by uncommenting lines 113-115 initially. Then recomment when table is populated.

Create TABLE booklist (
    id serial primary key,
    writer varchar(40) NOT NULL,
    title varchar(80) NOT NULL,
    wkey varchar(12) NOT NULL,
    notes varchar(100),
    type char(4) NOT NULL
);


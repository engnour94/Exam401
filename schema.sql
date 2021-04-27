DROP TABLE IF EXISTS product;
CREATE TABLE product(
    id SERIAL PRIMARY KEY,
    name  VARCHAR (255),
    image VARCHAR(255),
    price VARCHAR(255),
    description TEXT
)
 
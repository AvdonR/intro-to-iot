-- Drops locks table
DROP TABLE IF EXISTS locks;

-- Creates locks table
CREATE TABLE IF NOT EXISTS locks (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    , user_id varchar(50) NOT NULL
    , lock_name varchar(50) NOT NULL
    , ip varchar(20) NOT NULL
    , status boolean NOT NULL
);
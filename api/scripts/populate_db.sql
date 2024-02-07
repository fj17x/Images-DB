--\i api/scripts/populate_db.sql
DROP DATABASE IF EXISTS imagesdb;
CREATE DATABASE imagesdb;
\c imagesdb;

DROP TABLE IF EXISTS "Images";
DROP TABLE IF EXISTS "Users";

CREATE TABLE "Users" (
"id"   BIGSERIAL ,
"userName" VARCHAR(15) NOT NULL UNIQUE,
"password" VARCHAR(255) NOT NULL, "isAdmin" BOOLEAN DEFAULT false,
"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
"destroyTime" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id")
);

CREATE TABLE "Images" (
"id"   BIGSERIAL ,
"url" VARCHAR(255) NOT NULL, 
"title" VARCHAR(65) NOT NULL, "description" TEXT DEFAULT '',
"ownerId" INTEGER REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
"tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[], "isFlagged" BOOLEAN DEFAULT false,
"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
"destroyTime" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id")
);


\i populate_users_only.sql
\i populate_images_only.sql
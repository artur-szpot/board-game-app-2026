INSERT INTO users(
   id, 
   username, 
   email,
   password, 
   joined_date
)
VALUES (
   '123-abc', 
   'Test User', 
   'test@example.com', 
   '$2a$12$N3SbUkcIITkuNAGeDObmQO4CbLbdmNR/FR4W.nXnPNiElYBm5Sz.u', --'this-will-be-hashed'
   CURRENT_TIMESTAMP
);

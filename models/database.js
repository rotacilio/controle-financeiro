const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/controle_financeiro';

const client = new pg.Client(connectionString);
client.connect();

const query = client.query("CREATE TABLE public.tb_users (\
                                user_id serial NOT NULL, \
                                user_name character varying(100) NOT NULL, \
                                user_email character varying(100) NOT NULL, \
                                user_password character varying(50) NOT NULL, \
                                user_storage_date timestamp without time zone NOT NULL, \
                                user_status boolean NOT NULL, \
                                CONSTRAINT pk_user_id PRIMARY KEY (user_id), \
                                CONSTRAINT uq_user_email UNIQUE (user_email)\
                            ) WITH (\
                                OIDS = FALSE\
                            );");

query.on('end', () => {
    client.end();
});
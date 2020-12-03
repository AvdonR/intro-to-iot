import * as express from "express";
import pgPromise from "pg-promise";

export const register = ( app: express.Application ) => {
    const oidc = app.locals.oidc;
    const port = parseInt( process.env.PGPORT || "5432", 10 );
    const config = {
        database: process.env.PGDATABASE || "postgres",
        host: process.env.PGHOST || "localhost",
        port,
        user: process.env.PGUSER || "postgres"
    };

    const pgp = pgPromise();
    const db = pgp( config );

    app.get( `/api/locks/all`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const locks = await db.any( `
                SELECT
                    id
                    , lock_name
                    , ip
                    , status
                FROM    locks
                WHERE   user_id = $[userId]
                ORDER BY ip, status`, { userId } );
            return res.json( locks );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.get( `/api/locks/total`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const total = await db.one( `
            SELECT  count(*) AS total
            FROM    locks
            WHERE   user_id = $[userId]`, { userId }, ( data: { total: number } ) => {
                return {
                    total: + data.total
                };
            } );
            return res.json( total );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.get( `/api/locks/find/:search`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const locks = await db.any( `
                SELECT
                    id
                    , lock_name
                    , ip
                    , status
                FROM    locks
                WHERE   user_id = $[userId]
                AND   ( lock_name ILIKE $[search] OR ip ILIKE $[search] OR status ILIKE $[search] )`,
                { userId, search: `%${ req.params.search }%` } );
            return res.json( locks );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.post( `/api/locks/add`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one( `
                INSERT INTO locks( user_id, lock_name, ip, status )
                VALUES( $[userId], $[lock_name], $[ip], $[status] )
                RETURNING id;`,
                { userId, ...req.body  } );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.post( `/api/locks/update/:id`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one( `
                UPDATE  locks
                SET     status = 'Closed'
                WHERE   user_id = $[userId]
                AND     id = $[id]
                RETURNING id`,
                { userId, id: req.params.id, status: req.params.status  } );
                // { userId, ...req.body  } );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.delete( `/api/locks/remove/:id`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.result( `
                DELETE
                FROM    locks
                WHERE   user_id = $[userId]
                AND     id = $[id]`,
                { userId, id: req.params.id  }, ( r ) => r.rowCount );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );
};
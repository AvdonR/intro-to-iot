"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const register = (app) => {
    const oidc = app.locals.oidc;
    const port = parseInt(process.env.PGPORT || "5432", 10);
    const config = {
        database: process.env.PGDATABASE || "postgres",
        host: process.env.PGHOST || "localhost",
        port,
        user: process.env.PGUSER || "postgres"
    };
    const pgp = pg_promise_1.default();
    const db = pgp(config);
    app.get(`/api/locks/all`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const locks = yield db.any(`
                SELECT
                    id
                    , ip
                    , status
                FROM    locks
                WHERE   user_id = $[userId]
                ORDER BY ip, status`, { userId });
            return res.json(locks);
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
    app.get(`/api/locks/total`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const total = yield db.one(`
            SELECT  count(*) AS total
            FROM    locks
            WHERE   user_id = $[userId]`, { userId }, (data) => {
                return {
                    total: +data.total
                };
            });
            return res.json(total);
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
    app.get(`/api/locks/find/:search`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const locks = yield db.any(`
                SELECT
                    id
                    , ip
                    , status
                FROM    locks
                WHERE   user_id = $[userId]
                AND   ( ip ILIKE $[search] OR status ILIKE $[search] )`, { userId, search: `%${req.params.search}%` });
            return res.json(locks);
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
    app.post(`/api/locks/add`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = yield db.one(`
                INSERT INTO locks( user_id, ip, status )
                VALUES( $[userId], $[ip], $[status] )
                RETURNING id;`, Object.assign({ userId }, req.body));
            return res.json({ id });
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
    app.post(`/api/locks/update`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = yield db.one(`
                UPDATE locks
                SET ip = $[ip]
                    , status = $[status]
                WHERE
                    id = $[id]
                    AND user_id = $[userId]
                RETURNING
                    id;`, Object.assign({ userId }, req.body));
            return res.json({ id });
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
    app.delete(`/api/locks/remove/:id`, oidc.ensureAuthenticated(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = yield db.result(`
                DELETE
                FROM    locks
                WHERE   user_id = $[userId]
                AND     id = $[id]`, { userId, id: req.params.id }, (r) => r.rowCount);
            return res.json({ id });
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({ error: err.message || err });
        }
    }));
};
exports.register = register;
//# sourceMappingURL=api.js.map
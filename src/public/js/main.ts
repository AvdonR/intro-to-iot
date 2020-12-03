import axios from "axios";
import * as M from "materialize-css";
import Vue from "vue";

// tslint:disable-next-line no-unused-expression
new Vue( {
    computed: {
        hasLocks(): boolean {
            return (this as any).isLoading === false && (this as any).locks.length > 0;
        },
        noLocks(): boolean {
            return (this as any).isLoading === false && (this as any).locks.length === 0;
        }
    },
    data() {
        return {
            lock_name: "",
            ip: "",
            status: "",
            locks: [],
            isLoading: true,
            selectedLock: "",
            selectedLockID: 0
        };
    },
    el: "#app",
    methods: {
        addLock() {
            const lock = {
                lock_name: (this as any).lock_name,
                ip: (this as any).ip,
                status: (this as any).status
            };
            axios
                .post( "/api/locks/add", lock )
                .then( () => {
                    (this as any).$refs.lock_name.focus();
                    (this as any).lock_name = "";
                    (this as any).ip = "";
                    (this as any).status = "";
                    (this as any).loadLocks();
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        confirmDeleteLock( id: string ) {
            const lock = (this as any).locks.find( ( l: { id: string; } ) => l.id === id );
            (this as any).selectedLock = `${ lock.lock_name } ${ lock.ip } ${ lock.status }`;
            (this as any).selectedLockID = lock.id;
            const dc = this.$refs.deleteConfirm;
            const modal = M.Modal.init( dc as Element );
            modal.open();
        },
        deleteLock( id: string ) {
            axios
                .delete( `/api/locks/remove/${ id }` )
                .then( (this as any).loadLocks )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        confirmEditLock( id: string ) {
            const lock = (this as any).locks.find( ( l: { id: string; } ) => l.id === id );
            (this as any).selectedLock = `${ lock.lock_name } ${ lock.ip } ${ lock.status }`;
            (this as any).selectedLockID = lock.id;
            const dc = this.$refs.editConfirm;
            const modal = M.Modal.init( dc as Element );
            modal.open();
        },
        editLock( id: string ) {
            if ((this as any).status.localeCompare("Open")){
                status = "Open";
            } else{
                status = "Closed";
            };
            const lock = {
                status
            };
            // tslint:disable-next-line:no-console
            console.log("main");
            axios
                .post( `/api/locks/update/${ id }` , lock)
                .then( (this as any).loadLocks() )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        loadLocks() {
            axios
                .get( "/api/locks/all" )
                .then( ( res: any ) => {
                    (this as any).isLoading = false;
                    (this as any).locks = res.data;
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        }
    },
    mounted() {
        return (this as any).loadLocks();
    }
} );

import axios from "axios";
import * as M from "materialize-css";
import Vue from "vue";

// tslint:disable-next-line no-unused-expression
new Vue( {
    computed: {
        hasLocks(): boolean {
            return this.isLoading === false && this.locks.length > 0;
        },
        noLocks(): boolean {
            return this.isLoading === false && this.locks.length === 0;
        }
    },
    data() {
        return {
            lock_name: "",
            ip: "",
            status: true,
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
                lock_name: this.lock_name,
                ip: this.ip,
                status: this.status
            };
            axios
                .post( "/api/locks/add", lock )
                .then( () => {
                    this.$refs.lock_name.focus();
                    this.ip = "";
                    this.status = true;
                    this.lockLocks();
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        confirmDeleteLock( id: string ) {
            const lock = this.locks.find( ( l: { id: string; } ) => l.id === id );
            this.selectedLock = `${ lock.lock_name } ${ lock.ip } ${ lock.status }`;
            this.selectedLockID = lock.id;
            const dc = this.$refs.deleteConfirm;
            const modal = M.Modal.init( dc );
            modal.open();
        },
        deleteLock( id: string ) {
            axios
                .delete( `/api/locks/remove/${ id }` )
                .then( this.loadLocks )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        loadLocks() {
            axios
                .get( "/api/locks/all" )
                .then( ( res: any ) => {
                    this.isLoading = false;
                    this.locks = res.data;
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        }
    },
    mounted() {
        return this.loadLocks();
    }
} );

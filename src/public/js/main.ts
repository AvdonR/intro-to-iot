import axios from "axios";
import * as M from "materialize-css";
import Vue from "vue";
import * as mqtt from "mqtt";
import { IClientPublishOptions } from "mqtt";

const client = mqtt.connect('ws://localhost:9000');
client.on('connect', () => {
    console.log('Connection succeeded!')
});
client.on('message', (topic, message) => {
    console.log(`Received message ${message} from topic ${topic}`);
});
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
                .then( (userId) => {
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
            const lock = {
                lock_name: (this as any).lock_name,
                ip: (this as any).ip,
                status: (this as any).status,
                id: id
            };
            client.unsubscribe(`home/sensors/lock_state`);
            client.subscribe(`home/sensors/lock_state`, (error, res) => {
                if (error) {
                  console.log('Subscribe to topics error', error)
                  return
                }
                console.log('Subscribe to topics res', res)
            });
            var qos = 0;
            client.publish(`home/sensors/id`, lock.id, (qos as IClientPublishOptions), error=> {
                // tslint:disable-next-line:no-console
                console.log( lock.id );
            });
            axios
                .post( `/api/locks/update/${ id }`)
                .then( (this as any).loadLocks )
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
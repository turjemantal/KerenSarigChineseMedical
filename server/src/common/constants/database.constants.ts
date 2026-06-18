// URI scheme prefixes and the set of hosts we treat as "local". Used by the
// startup safety guard so a non-PROD process can never connect to a remote
// (Atlas) database — see main.ts.
export const MONGODB_SRV_PREFIX = 'mongodb+srv://';
export const MONGODB_PREFIX = 'mongodb://';
export const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', '::1', '0.0.0.0', 'mongo'] as const;

// @src/background/databaseStore.ts

type DatabaseStore = {
  name: string;
  idx: number;
};

type ParentDatabaseStore = {
  stores: DatabaseStore[];
};

const databaseStore1: DatabaseStore = {
  name: 'John Doe',
  idx: 1,
};

const databaseStore2: DatabaseStore = {
  name: 'Benny Woo',
  idx: 1,
};

const parentDatabaseStore: ParentDatabaseStore = {
  stores: [databaseStore1, databaseStore2],
};

// export default parentDatabaseStore;

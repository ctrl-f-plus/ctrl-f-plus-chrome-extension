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

// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// interface Shape {}
// declare function getShape(): Shape;

// interface PaintOptions {
//   shape: Shape;
//   xPos?: number;
//   yPos?: number;
// }

// // ---cut---
// function paintShape(opts: PaintOptions) {
//   getShape();
//   let xPos = opts.xPos === undefined ? 0 : opts.xPos;
//   //  ^?
//   let yPos = opts.yPos === undefined ? 0 : opts.yPos;
//   //  ^?
//   // ...
// }

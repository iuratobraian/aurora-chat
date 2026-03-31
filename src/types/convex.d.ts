declare module '*convex/_generated/api' {
  export const api: any;
}

declare module '*convex/_generated/dataModel' {
  export type Id<T extends string = string> = string & { __tableName: T };
}

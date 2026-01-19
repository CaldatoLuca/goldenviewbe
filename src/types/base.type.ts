export type Operations =
  | "aggregate"
  | "count"
  | "create"
  | "createMany"
  | "delete"
  | "deleteMany"
  | "findFirst"
  | "findMany"
  | "findUnique"
  | "update"
  | "updateMany"
  | "upsert";

export type DelegateArgs<T> = {
  [K in keyof T]: T[K] extends (args: infer A) => Promise<any> ? A : never;
};

export type DelegateReturnTypes<T> = {
  [K in keyof T]: T[K] extends (args: any) => Promise<infer R> ? R : never;
};

export type WhereArgs<T> = T extends { where: infer W } ? W : never;

export type DataArgs<T> = T extends { data: infer D } ? D : never;

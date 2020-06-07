type PUUID = string;
type SUUID = string;
type CUUID = string;
type DUUID = string;

type Promish<T> = Promise<T> | T;
type ValueOf<T> = T[keyof T];
type OneOf<T extends any[]> = T[number];

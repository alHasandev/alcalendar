export type TNumber<T> = T extends Record<string | number | symbol, unknown>
  ? {
      [K in keyof T as K]: number
    }
  : number

export type TBoolean<T> = T extends Record<string | number | symbol, unknown>
  ? {
      [K in keyof T as K]: boolean
    }
  : boolean


/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Usuario
 * Tabla física: usuarios (Administrador, Supervisor, Auditor)
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model TrackingUbicacion
 * Historial de posiciones GPS del personal de campo (Supervisor/Auditor) — permite
 * reconstruir la ruta recorrida en el mapa de supervisión (Fase 2/Fase 6 del flujo).
 */
export type TrackingUbicacion = $Result.DefaultSelection<Prisma.$TrackingUbicacionPayload>
/**
 * Model DispositivoAutorizado
 * Tabla física: dispositivos_autorizados — vincula un usuario a los dispositivos desde los que ha iniciado sesión
 */
export type DispositivoAutorizado = $Result.DefaultSelection<Prisma.$DispositivoAutorizadoPayload>
/**
 * Model Expediente
 * Tabla física: expedientes — ficha de crédito/cliente a auditar, prellenada por importación
 */
export type Expediente = $Result.DefaultSelection<Prisma.$ExpedientePayload>
/**
 * Model AsignacionAuditoria
 * Tabla física: asignaciones_auditoria — auditor ↔ expediente (muestra a visitar)
 */
export type AsignacionAuditoria = $Result.DefaultSelection<Prisma.$AsignacionAuditoriaPayload>
/**
 * Model VisitaAuditoria
 * Tabla física: visitas_auditoria — ejecución real de la ficha de entrevista en campo
 */
export type VisitaAuditoria = $Result.DefaultSelection<Prisma.$VisitaAuditoriaPayload>
/**
 * Model Evidencia
 * Tabla física: evidencias — fotografías/documentos de una visita
 */
export type Evidencia = $Result.DefaultSelection<Prisma.$EvidenciaPayload>
/**
 * Model AuditoriaSeguridad
 * Registro inmutable de auditoría de seguridad (acceso y operaciones)
 */
export type AuditoriaSeguridad = $Result.DefaultSelection<Prisma.$AuditoriaSeguridadPayload>
/**
 * Model ImportacionMasiva
 * Importación masiva de expedientes por Excel (no hay integración en vivo con Caja Huancayo todavía)
 */
export type ImportacionMasiva = $Result.DefaultSelection<Prisma.$ImportacionMasivaPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TipoDocumento: {
  DNI: 'DNI',
  CE: 'CE',
  PASAPORTE: 'PASAPORTE',
  RUC: 'RUC'
};

export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento]


export const TipoCredito: {
  CONSUMO: 'CONSUMO',
  OTROS: 'OTROS'
};

export type TipoCredito = (typeof TipoCredito)[keyof typeof TipoCredito]

}

export type TipoDocumento = $Enums.TipoDocumento

export const TipoDocumento: typeof $Enums.TipoDocumento

export type TipoCredito = $Enums.TipoCredito

export const TipoCredito: typeof $Enums.TipoCredito

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Usuarios
   * const usuarios = await prisma.usuario.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trackingUbicacion`: Exposes CRUD operations for the **TrackingUbicacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrackingUbicacions
    * const trackingUbicacions = await prisma.trackingUbicacion.findMany()
    * ```
    */
  get trackingUbicacion(): Prisma.TrackingUbicacionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dispositivoAutorizado`: Exposes CRUD operations for the **DispositivoAutorizado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DispositivoAutorizados
    * const dispositivoAutorizados = await prisma.dispositivoAutorizado.findMany()
    * ```
    */
  get dispositivoAutorizado(): Prisma.DispositivoAutorizadoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.expediente`: Exposes CRUD operations for the **Expediente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Expedientes
    * const expedientes = await prisma.expediente.findMany()
    * ```
    */
  get expediente(): Prisma.ExpedienteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.asignacionAuditoria`: Exposes CRUD operations for the **AsignacionAuditoria** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AsignacionAuditorias
    * const asignacionAuditorias = await prisma.asignacionAuditoria.findMany()
    * ```
    */
  get asignacionAuditoria(): Prisma.AsignacionAuditoriaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.visitaAuditoria`: Exposes CRUD operations for the **VisitaAuditoria** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VisitaAuditorias
    * const visitaAuditorias = await prisma.visitaAuditoria.findMany()
    * ```
    */
  get visitaAuditoria(): Prisma.VisitaAuditoriaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.evidencia`: Exposes CRUD operations for the **Evidencia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Evidencias
    * const evidencias = await prisma.evidencia.findMany()
    * ```
    */
  get evidencia(): Prisma.EvidenciaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditoriaSeguridad`: Exposes CRUD operations for the **AuditoriaSeguridad** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditoriaSeguridads
    * const auditoriaSeguridads = await prisma.auditoriaSeguridad.findMany()
    * ```
    */
  get auditoriaSeguridad(): Prisma.AuditoriaSeguridadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.importacionMasiva`: Exposes CRUD operations for the **ImportacionMasiva** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ImportacionMasivas
    * const importacionMasivas = await prisma.importacionMasiva.findMany()
    * ```
    */
  get importacionMasiva(): Prisma.ImportacionMasivaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Usuario: 'Usuario',
    TrackingUbicacion: 'TrackingUbicacion',
    DispositivoAutorizado: 'DispositivoAutorizado',
    Expediente: 'Expediente',
    AsignacionAuditoria: 'AsignacionAuditoria',
    VisitaAuditoria: 'VisitaAuditoria',
    Evidencia: 'Evidencia',
    AuditoriaSeguridad: 'AuditoriaSeguridad',
    ImportacionMasiva: 'ImportacionMasiva'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "usuario" | "trackingUbicacion" | "dispositivoAutorizado" | "expediente" | "asignacionAuditoria" | "visitaAuditoria" | "evidencia" | "auditoriaSeguridad" | "importacionMasiva"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      TrackingUbicacion: {
        payload: Prisma.$TrackingUbicacionPayload<ExtArgs>
        fields: Prisma.TrackingUbicacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrackingUbicacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrackingUbicacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          findFirst: {
            args: Prisma.TrackingUbicacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrackingUbicacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          findMany: {
            args: Prisma.TrackingUbicacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>[]
          }
          create: {
            args: Prisma.TrackingUbicacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          createMany: {
            args: Prisma.TrackingUbicacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TrackingUbicacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          update: {
            args: Prisma.TrackingUbicacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          deleteMany: {
            args: Prisma.TrackingUbicacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrackingUbicacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrackingUbicacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackingUbicacionPayload>
          }
          aggregate: {
            args: Prisma.TrackingUbicacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrackingUbicacion>
          }
          groupBy: {
            args: Prisma.TrackingUbicacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrackingUbicacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrackingUbicacionCountArgs<ExtArgs>
            result: $Utils.Optional<TrackingUbicacionCountAggregateOutputType> | number
          }
        }
      }
      DispositivoAutorizado: {
        payload: Prisma.$DispositivoAutorizadoPayload<ExtArgs>
        fields: Prisma.DispositivoAutorizadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DispositivoAutorizadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DispositivoAutorizadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          findFirst: {
            args: Prisma.DispositivoAutorizadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DispositivoAutorizadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          findMany: {
            args: Prisma.DispositivoAutorizadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>[]
          }
          create: {
            args: Prisma.DispositivoAutorizadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          createMany: {
            args: Prisma.DispositivoAutorizadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DispositivoAutorizadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          update: {
            args: Prisma.DispositivoAutorizadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          deleteMany: {
            args: Prisma.DispositivoAutorizadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DispositivoAutorizadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DispositivoAutorizadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispositivoAutorizadoPayload>
          }
          aggregate: {
            args: Prisma.DispositivoAutorizadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDispositivoAutorizado>
          }
          groupBy: {
            args: Prisma.DispositivoAutorizadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DispositivoAutorizadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DispositivoAutorizadoCountArgs<ExtArgs>
            result: $Utils.Optional<DispositivoAutorizadoCountAggregateOutputType> | number
          }
        }
      }
      Expediente: {
        payload: Prisma.$ExpedientePayload<ExtArgs>
        fields: Prisma.ExpedienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExpedienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExpedienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          findFirst: {
            args: Prisma.ExpedienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExpedienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          findMany: {
            args: Prisma.ExpedienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>[]
          }
          create: {
            args: Prisma.ExpedienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          createMany: {
            args: Prisma.ExpedienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ExpedienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          update: {
            args: Prisma.ExpedienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          deleteMany: {
            args: Prisma.ExpedienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExpedienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExpedienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpedientePayload>
          }
          aggregate: {
            args: Prisma.ExpedienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExpediente>
          }
          groupBy: {
            args: Prisma.ExpedienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExpedienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExpedienteCountArgs<ExtArgs>
            result: $Utils.Optional<ExpedienteCountAggregateOutputType> | number
          }
        }
      }
      AsignacionAuditoria: {
        payload: Prisma.$AsignacionAuditoriaPayload<ExtArgs>
        fields: Prisma.AsignacionAuditoriaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AsignacionAuditoriaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AsignacionAuditoriaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          findFirst: {
            args: Prisma.AsignacionAuditoriaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AsignacionAuditoriaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          findMany: {
            args: Prisma.AsignacionAuditoriaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>[]
          }
          create: {
            args: Prisma.AsignacionAuditoriaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          createMany: {
            args: Prisma.AsignacionAuditoriaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AsignacionAuditoriaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          update: {
            args: Prisma.AsignacionAuditoriaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          deleteMany: {
            args: Prisma.AsignacionAuditoriaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AsignacionAuditoriaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AsignacionAuditoriaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionAuditoriaPayload>
          }
          aggregate: {
            args: Prisma.AsignacionAuditoriaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsignacionAuditoria>
          }
          groupBy: {
            args: Prisma.AsignacionAuditoriaGroupByArgs<ExtArgs>
            result: $Utils.Optional<AsignacionAuditoriaGroupByOutputType>[]
          }
          count: {
            args: Prisma.AsignacionAuditoriaCountArgs<ExtArgs>
            result: $Utils.Optional<AsignacionAuditoriaCountAggregateOutputType> | number
          }
        }
      }
      VisitaAuditoria: {
        payload: Prisma.$VisitaAuditoriaPayload<ExtArgs>
        fields: Prisma.VisitaAuditoriaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VisitaAuditoriaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VisitaAuditoriaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          findFirst: {
            args: Prisma.VisitaAuditoriaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VisitaAuditoriaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          findMany: {
            args: Prisma.VisitaAuditoriaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>[]
          }
          create: {
            args: Prisma.VisitaAuditoriaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          createMany: {
            args: Prisma.VisitaAuditoriaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.VisitaAuditoriaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          update: {
            args: Prisma.VisitaAuditoriaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          deleteMany: {
            args: Prisma.VisitaAuditoriaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VisitaAuditoriaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VisitaAuditoriaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitaAuditoriaPayload>
          }
          aggregate: {
            args: Prisma.VisitaAuditoriaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVisitaAuditoria>
          }
          groupBy: {
            args: Prisma.VisitaAuditoriaGroupByArgs<ExtArgs>
            result: $Utils.Optional<VisitaAuditoriaGroupByOutputType>[]
          }
          count: {
            args: Prisma.VisitaAuditoriaCountArgs<ExtArgs>
            result: $Utils.Optional<VisitaAuditoriaCountAggregateOutputType> | number
          }
        }
      }
      Evidencia: {
        payload: Prisma.$EvidenciaPayload<ExtArgs>
        fields: Prisma.EvidenciaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EvidenciaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EvidenciaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          findFirst: {
            args: Prisma.EvidenciaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EvidenciaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          findMany: {
            args: Prisma.EvidenciaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>[]
          }
          create: {
            args: Prisma.EvidenciaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          createMany: {
            args: Prisma.EvidenciaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.EvidenciaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          update: {
            args: Prisma.EvidenciaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          deleteMany: {
            args: Prisma.EvidenciaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EvidenciaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EvidenciaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenciaPayload>
          }
          aggregate: {
            args: Prisma.EvidenciaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvidencia>
          }
          groupBy: {
            args: Prisma.EvidenciaGroupByArgs<ExtArgs>
            result: $Utils.Optional<EvidenciaGroupByOutputType>[]
          }
          count: {
            args: Prisma.EvidenciaCountArgs<ExtArgs>
            result: $Utils.Optional<EvidenciaCountAggregateOutputType> | number
          }
        }
      }
      AuditoriaSeguridad: {
        payload: Prisma.$AuditoriaSeguridadPayload<ExtArgs>
        fields: Prisma.AuditoriaSeguridadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditoriaSeguridadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditoriaSeguridadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          findFirst: {
            args: Prisma.AuditoriaSeguridadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditoriaSeguridadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          findMany: {
            args: Prisma.AuditoriaSeguridadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>[]
          }
          create: {
            args: Prisma.AuditoriaSeguridadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          createMany: {
            args: Prisma.AuditoriaSeguridadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AuditoriaSeguridadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          update: {
            args: Prisma.AuditoriaSeguridadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          deleteMany: {
            args: Prisma.AuditoriaSeguridadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditoriaSeguridadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditoriaSeguridadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaSeguridadPayload>
          }
          aggregate: {
            args: Prisma.AuditoriaSeguridadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditoriaSeguridad>
          }
          groupBy: {
            args: Prisma.AuditoriaSeguridadGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditoriaSeguridadGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditoriaSeguridadCountArgs<ExtArgs>
            result: $Utils.Optional<AuditoriaSeguridadCountAggregateOutputType> | number
          }
        }
      }
      ImportacionMasiva: {
        payload: Prisma.$ImportacionMasivaPayload<ExtArgs>
        fields: Prisma.ImportacionMasivaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ImportacionMasivaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ImportacionMasivaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          findFirst: {
            args: Prisma.ImportacionMasivaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ImportacionMasivaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          findMany: {
            args: Prisma.ImportacionMasivaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>[]
          }
          create: {
            args: Prisma.ImportacionMasivaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          createMany: {
            args: Prisma.ImportacionMasivaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ImportacionMasivaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          update: {
            args: Prisma.ImportacionMasivaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          deleteMany: {
            args: Prisma.ImportacionMasivaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ImportacionMasivaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ImportacionMasivaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportacionMasivaPayload>
          }
          aggregate: {
            args: Prisma.ImportacionMasivaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateImportacionMasiva>
          }
          groupBy: {
            args: Prisma.ImportacionMasivaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ImportacionMasivaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ImportacionMasivaCountArgs<ExtArgs>
            result: $Utils.Optional<ImportacionMasivaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    usuario?: UsuarioOmit
    trackingUbicacion?: TrackingUbicacionOmit
    dispositivoAutorizado?: DispositivoAutorizadoOmit
    expediente?: ExpedienteOmit
    asignacionAuditoria?: AsignacionAuditoriaOmit
    visitaAuditoria?: VisitaAuditoriaOmit
    evidencia?: EvidenciaOmit
    auditoriaSeguridad?: AuditoriaSeguridadOmit
    importacionMasiva?: ImportacionMasivaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    asignaciones: number
    visitas: number
    dispositivos: number
    trackings: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | UsuarioCountOutputTypeCountAsignacionesArgs
    visitas?: boolean | UsuarioCountOutputTypeCountVisitasArgs
    dispositivos?: boolean | UsuarioCountOutputTypeCountDispositivosArgs
    trackings?: boolean | UsuarioCountOutputTypeCountTrackingsArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountAsignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionAuditoriaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountVisitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VisitaAuditoriaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountDispositivosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispositivoAutorizadoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountTrackingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackingUbicacionWhereInput
  }


  /**
   * Count Type ExpedienteCountOutputType
   */

  export type ExpedienteCountOutputType = {
    asignaciones: number
    visitas: number
  }

  export type ExpedienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | ExpedienteCountOutputTypeCountAsignacionesArgs
    visitas?: boolean | ExpedienteCountOutputTypeCountVisitasArgs
  }

  // Custom InputTypes
  /**
   * ExpedienteCountOutputType without action
   */
  export type ExpedienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExpedienteCountOutputType
     */
    select?: ExpedienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ExpedienteCountOutputType without action
   */
  export type ExpedienteCountOutputTypeCountAsignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionAuditoriaWhereInput
  }

  /**
   * ExpedienteCountOutputType without action
   */
  export type ExpedienteCountOutputTypeCountVisitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VisitaAuditoriaWhereInput
  }


  /**
   * Count Type VisitaAuditoriaCountOutputType
   */

  export type VisitaAuditoriaCountOutputType = {
    evidencias: number
  }

  export type VisitaAuditoriaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    evidencias?: boolean | VisitaAuditoriaCountOutputTypeCountEvidenciasArgs
  }

  // Custom InputTypes
  /**
   * VisitaAuditoriaCountOutputType without action
   */
  export type VisitaAuditoriaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoriaCountOutputType
     */
    select?: VisitaAuditoriaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VisitaAuditoriaCountOutputType without action
   */
  export type VisitaAuditoriaCountOutputTypeCountEvidenciasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenciaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioAvgAggregateOutputType = {
    token_version: number | null
    intentos_fallidos: number | null
    latitud: Decimal | null
    longitud: Decimal | null
  }

  export type UsuarioSumAggregateOutputType = {
    token_version: number | null
    intentos_fallidos: number | null
    latitud: Decimal | null
    longitud: Decimal | null
  }

  export type UsuarioMinAggregateOutputType = {
    id_usuario: string | null
    username: string | null
    nombres: string | null
    apellidos: string | null
    email: string | null
    sede: string | null
    departamento: string | null
    password_hash: string | null
    rol: string | null
    estado: string | null
    fecha_creacion: Date | null
    mfa_habilitado: boolean | null
    mfa_requerido: boolean | null
    mfa_exento: boolean | null
    mfa_secreto: string | null
    mfa_ultimo_uso: Date | null
    token_version: number | null
    intentos_fallidos: number | null
    bloqueado_hasta: Date | null
    ultimo_acceso: Date | null
    password_cambio: Date | null
    latitud: Decimal | null
    longitud: Decimal | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id_usuario: string | null
    username: string | null
    nombres: string | null
    apellidos: string | null
    email: string | null
    sede: string | null
    departamento: string | null
    password_hash: string | null
    rol: string | null
    estado: string | null
    fecha_creacion: Date | null
    mfa_habilitado: boolean | null
    mfa_requerido: boolean | null
    mfa_exento: boolean | null
    mfa_secreto: string | null
    mfa_ultimo_uso: Date | null
    token_version: number | null
    intentos_fallidos: number | null
    bloqueado_hasta: Date | null
    ultimo_acceso: Date | null
    password_cambio: Date | null
    latitud: Decimal | null
    longitud: Decimal | null
  }

  export type UsuarioCountAggregateOutputType = {
    id_usuario: number
    username: number
    nombres: number
    apellidos: number
    email: number
    sede: number
    departamento: number
    password_hash: number
    rol: number
    estado: number
    fecha_creacion: number
    mfa_habilitado: number
    mfa_requerido: number
    mfa_exento: number
    mfa_secreto: number
    mfa_ultimo_uso: number
    token_version: number
    intentos_fallidos: number
    bloqueado_hasta: number
    ultimo_acceso: number
    password_cambio: number
    latitud: number
    longitud: number
    _all: number
  }


  export type UsuarioAvgAggregateInputType = {
    token_version?: true
    intentos_fallidos?: true
    latitud?: true
    longitud?: true
  }

  export type UsuarioSumAggregateInputType = {
    token_version?: true
    intentos_fallidos?: true
    latitud?: true
    longitud?: true
  }

  export type UsuarioMinAggregateInputType = {
    id_usuario?: true
    username?: true
    nombres?: true
    apellidos?: true
    email?: true
    sede?: true
    departamento?: true
    password_hash?: true
    rol?: true
    estado?: true
    fecha_creacion?: true
    mfa_habilitado?: true
    mfa_requerido?: true
    mfa_exento?: true
    mfa_secreto?: true
    mfa_ultimo_uso?: true
    token_version?: true
    intentos_fallidos?: true
    bloqueado_hasta?: true
    ultimo_acceso?: true
    password_cambio?: true
    latitud?: true
    longitud?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id_usuario?: true
    username?: true
    nombres?: true
    apellidos?: true
    email?: true
    sede?: true
    departamento?: true
    password_hash?: true
    rol?: true
    estado?: true
    fecha_creacion?: true
    mfa_habilitado?: true
    mfa_requerido?: true
    mfa_exento?: true
    mfa_secreto?: true
    mfa_ultimo_uso?: true
    token_version?: true
    intentos_fallidos?: true
    bloqueado_hasta?: true
    ultimo_acceso?: true
    password_cambio?: true
    latitud?: true
    longitud?: true
  }

  export type UsuarioCountAggregateInputType = {
    id_usuario?: true
    username?: true
    nombres?: true
    apellidos?: true
    email?: true
    sede?: true
    departamento?: true
    password_hash?: true
    rol?: true
    estado?: true
    fecha_creacion?: true
    mfa_habilitado?: true
    mfa_requerido?: true
    mfa_exento?: true
    mfa_secreto?: true
    mfa_ultimo_uso?: true
    token_version?: true
    intentos_fallidos?: true
    bloqueado_hasta?: true
    ultimo_acceso?: true
    password_cambio?: true
    latitud?: true
    longitud?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsuarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsuarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _avg?: UsuarioAvgAggregateInputType
    _sum?: UsuarioSumAggregateInputType
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id_usuario: string
    username: string
    nombres: string | null
    apellidos: string | null
    email: string | null
    sede: string | null
    departamento: string | null
    password_hash: string
    rol: string
    estado: string
    fecha_creacion: Date
    mfa_habilitado: boolean
    mfa_requerido: boolean
    mfa_exento: boolean
    mfa_secreto: string | null
    mfa_ultimo_uso: Date | null
    token_version: number
    intentos_fallidos: number
    bloqueado_hasta: Date | null
    ultimo_acceso: Date | null
    password_cambio: Date
    latitud: Decimal | null
    longitud: Decimal | null
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usuario?: boolean
    username?: boolean
    nombres?: boolean
    apellidos?: boolean
    email?: boolean
    sede?: boolean
    departamento?: boolean
    password_hash?: boolean
    rol?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: boolean
    mfa_ultimo_uso?: boolean
    token_version?: boolean
    intentos_fallidos?: boolean
    bloqueado_hasta?: boolean
    ultimo_acceso?: boolean
    password_cambio?: boolean
    latitud?: boolean
    longitud?: boolean
    asignaciones?: boolean | Usuario$asignacionesArgs<ExtArgs>
    visitas?: boolean | Usuario$visitasArgs<ExtArgs>
    dispositivos?: boolean | Usuario$dispositivosArgs<ExtArgs>
    trackings?: boolean | Usuario$trackingsArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>



  export type UsuarioSelectScalar = {
    id_usuario?: boolean
    username?: boolean
    nombres?: boolean
    apellidos?: boolean
    email?: boolean
    sede?: boolean
    departamento?: boolean
    password_hash?: boolean
    rol?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: boolean
    mfa_ultimo_uso?: boolean
    token_version?: boolean
    intentos_fallidos?: boolean
    bloqueado_hasta?: boolean
    ultimo_acceso?: boolean
    password_cambio?: boolean
    latitud?: boolean
    longitud?: boolean
  }

  export type UsuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_usuario" | "username" | "nombres" | "apellidos" | "email" | "sede" | "departamento" | "password_hash" | "rol" | "estado" | "fecha_creacion" | "mfa_habilitado" | "mfa_requerido" | "mfa_exento" | "mfa_secreto" | "mfa_ultimo_uso" | "token_version" | "intentos_fallidos" | "bloqueado_hasta" | "ultimo_acceso" | "password_cambio" | "latitud" | "longitud", ExtArgs["result"]["usuario"]>
  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | Usuario$asignacionesArgs<ExtArgs>
    visitas?: boolean | Usuario$visitasArgs<ExtArgs>
    dispositivos?: boolean | Usuario$dispositivosArgs<ExtArgs>
    trackings?: boolean | Usuario$trackingsArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      asignaciones: Prisma.$AsignacionAuditoriaPayload<ExtArgs>[]
      visitas: Prisma.$VisitaAuditoriaPayload<ExtArgs>[]
      dispositivos: Prisma.$DispositivoAutorizadoPayload<ExtArgs>[]
      trackings: Prisma.$TrackingUbicacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_usuario: string
      username: string
      nombres: string | null
      apellidos: string | null
      email: string | null
      sede: string | null
      departamento: string | null
      password_hash: string
      rol: string
      estado: string
      fecha_creacion: Date
      mfa_habilitado: boolean
      mfa_requerido: boolean
      mfa_exento: boolean
      mfa_secreto: string | null
      mfa_ultimo_uso: Date | null
      token_version: number
      intentos_fallidos: number
      bloqueado_hasta: Date | null
      ultimo_acceso: Date | null
      password_cambio: Date
      latitud: Prisma.Decimal | null
      longitud: Prisma.Decimal | null
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id_usuario`
     * const usuarioWithId_usuarioOnly = await prisma.usuario.findMany({ select: { id_usuario: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asignaciones<T extends Usuario$asignacionesArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$asignacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    visitas<T extends Usuario$visitasArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$visitasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dispositivos<T extends Usuario$dispositivosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$dispositivosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    trackings<T extends Usuario$trackingsArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$trackingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */
  interface UsuarioFieldRefs {
    readonly id_usuario: FieldRef<"Usuario", 'String'>
    readonly username: FieldRef<"Usuario", 'String'>
    readonly nombres: FieldRef<"Usuario", 'String'>
    readonly apellidos: FieldRef<"Usuario", 'String'>
    readonly email: FieldRef<"Usuario", 'String'>
    readonly sede: FieldRef<"Usuario", 'String'>
    readonly departamento: FieldRef<"Usuario", 'String'>
    readonly password_hash: FieldRef<"Usuario", 'String'>
    readonly rol: FieldRef<"Usuario", 'String'>
    readonly estado: FieldRef<"Usuario", 'String'>
    readonly fecha_creacion: FieldRef<"Usuario", 'DateTime'>
    readonly mfa_habilitado: FieldRef<"Usuario", 'Boolean'>
    readonly mfa_requerido: FieldRef<"Usuario", 'Boolean'>
    readonly mfa_exento: FieldRef<"Usuario", 'Boolean'>
    readonly mfa_secreto: FieldRef<"Usuario", 'String'>
    readonly mfa_ultimo_uso: FieldRef<"Usuario", 'DateTime'>
    readonly token_version: FieldRef<"Usuario", 'Int'>
    readonly intentos_fallidos: FieldRef<"Usuario", 'Int'>
    readonly bloqueado_hasta: FieldRef<"Usuario", 'DateTime'>
    readonly ultimo_acceso: FieldRef<"Usuario", 'DateTime'>
    readonly password_cambio: FieldRef<"Usuario", 'DateTime'>
    readonly latitud: FieldRef<"Usuario", 'Decimal'>
    readonly longitud: FieldRef<"Usuario", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to delete.
     */
    limit?: number
  }

  /**
   * Usuario.asignaciones
   */
  export type Usuario$asignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    where?: AsignacionAuditoriaWhereInput
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    cursor?: AsignacionAuditoriaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AsignacionAuditoriaScalarFieldEnum | AsignacionAuditoriaScalarFieldEnum[]
  }

  /**
   * Usuario.visitas
   */
  export type Usuario$visitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    where?: VisitaAuditoriaWhereInput
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    cursor?: VisitaAuditoriaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VisitaAuditoriaScalarFieldEnum | VisitaAuditoriaScalarFieldEnum[]
  }

  /**
   * Usuario.dispositivos
   */
  export type Usuario$dispositivosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    where?: DispositivoAutorizadoWhereInput
    orderBy?: DispositivoAutorizadoOrderByWithRelationInput | DispositivoAutorizadoOrderByWithRelationInput[]
    cursor?: DispositivoAutorizadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispositivoAutorizadoScalarFieldEnum | DispositivoAutorizadoScalarFieldEnum[]
  }

  /**
   * Usuario.trackings
   */
  export type Usuario$trackingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    where?: TrackingUbicacionWhereInput
    orderBy?: TrackingUbicacionOrderByWithRelationInput | TrackingUbicacionOrderByWithRelationInput[]
    cursor?: TrackingUbicacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackingUbicacionScalarFieldEnum | TrackingUbicacionScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model TrackingUbicacion
   */

  export type AggregateTrackingUbicacion = {
    _count: TrackingUbicacionCountAggregateOutputType | null
    _avg: TrackingUbicacionAvgAggregateOutputType | null
    _sum: TrackingUbicacionSumAggregateOutputType | null
    _min: TrackingUbicacionMinAggregateOutputType | null
    _max: TrackingUbicacionMaxAggregateOutputType | null
  }

  export type TrackingUbicacionAvgAggregateOutputType = {
    id_tracking: number | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
  }

  export type TrackingUbicacionSumAggregateOutputType = {
    id_tracking: bigint | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
  }

  export type TrackingUbicacionMinAggregateOutputType = {
    id_tracking: bigint | null
    id_usuario: string | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    registrado_en: Date | null
  }

  export type TrackingUbicacionMaxAggregateOutputType = {
    id_tracking: bigint | null
    id_usuario: string | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    registrado_en: Date | null
  }

  export type TrackingUbicacionCountAggregateOutputType = {
    id_tracking: number
    id_usuario: number
    latitud: number
    longitud: number
    precision_metros: number
    registrado_en: number
    _all: number
  }


  export type TrackingUbicacionAvgAggregateInputType = {
    id_tracking?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
  }

  export type TrackingUbicacionSumAggregateInputType = {
    id_tracking?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
  }

  export type TrackingUbicacionMinAggregateInputType = {
    id_tracking?: true
    id_usuario?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    registrado_en?: true
  }

  export type TrackingUbicacionMaxAggregateInputType = {
    id_tracking?: true
    id_usuario?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    registrado_en?: true
  }

  export type TrackingUbicacionCountAggregateInputType = {
    id_tracking?: true
    id_usuario?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    registrado_en?: true
    _all?: true
  }

  export type TrackingUbicacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackingUbicacion to aggregate.
     */
    where?: TrackingUbicacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackingUbicacions to fetch.
     */
    orderBy?: TrackingUbicacionOrderByWithRelationInput | TrackingUbicacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrackingUbicacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackingUbicacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackingUbicacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrackingUbicacions
    **/
    _count?: true | TrackingUbicacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrackingUbicacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrackingUbicacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackingUbicacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackingUbicacionMaxAggregateInputType
  }

  export type GetTrackingUbicacionAggregateType<T extends TrackingUbicacionAggregateArgs> = {
        [P in keyof T & keyof AggregateTrackingUbicacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrackingUbicacion[P]>
      : GetScalarType<T[P], AggregateTrackingUbicacion[P]>
  }




  export type TrackingUbicacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackingUbicacionWhereInput
    orderBy?: TrackingUbicacionOrderByWithAggregationInput | TrackingUbicacionOrderByWithAggregationInput[]
    by: TrackingUbicacionScalarFieldEnum[] | TrackingUbicacionScalarFieldEnum
    having?: TrackingUbicacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackingUbicacionCountAggregateInputType | true
    _avg?: TrackingUbicacionAvgAggregateInputType
    _sum?: TrackingUbicacionSumAggregateInputType
    _min?: TrackingUbicacionMinAggregateInputType
    _max?: TrackingUbicacionMaxAggregateInputType
  }

  export type TrackingUbicacionGroupByOutputType = {
    id_tracking: bigint
    id_usuario: string
    latitud: Decimal
    longitud: Decimal
    precision_metros: Decimal | null
    registrado_en: Date
    _count: TrackingUbicacionCountAggregateOutputType | null
    _avg: TrackingUbicacionAvgAggregateOutputType | null
    _sum: TrackingUbicacionSumAggregateOutputType | null
    _min: TrackingUbicacionMinAggregateOutputType | null
    _max: TrackingUbicacionMaxAggregateOutputType | null
  }

  type GetTrackingUbicacionGroupByPayload<T extends TrackingUbicacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrackingUbicacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackingUbicacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackingUbicacionGroupByOutputType[P]>
            : GetScalarType<T[P], TrackingUbicacionGroupByOutputType[P]>
        }
      >
    >


  export type TrackingUbicacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_tracking?: boolean
    id_usuario?: boolean
    latitud?: boolean
    longitud?: boolean
    precision_metros?: boolean
    registrado_en?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackingUbicacion"]>



  export type TrackingUbicacionSelectScalar = {
    id_tracking?: boolean
    id_usuario?: boolean
    latitud?: boolean
    longitud?: boolean
    precision_metros?: boolean
    registrado_en?: boolean
  }

  export type TrackingUbicacionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_tracking" | "id_usuario" | "latitud" | "longitud" | "precision_metros" | "registrado_en", ExtArgs["result"]["trackingUbicacion"]>
  export type TrackingUbicacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $TrackingUbicacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrackingUbicacion"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_tracking: bigint
      id_usuario: string
      latitud: Prisma.Decimal
      longitud: Prisma.Decimal
      precision_metros: Prisma.Decimal | null
      registrado_en: Date
    }, ExtArgs["result"]["trackingUbicacion"]>
    composites: {}
  }

  type TrackingUbicacionGetPayload<S extends boolean | null | undefined | TrackingUbicacionDefaultArgs> = $Result.GetResult<Prisma.$TrackingUbicacionPayload, S>

  type TrackingUbicacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TrackingUbicacionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TrackingUbicacionCountAggregateInputType | true
    }

  export interface TrackingUbicacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrackingUbicacion'], meta: { name: 'TrackingUbicacion' } }
    /**
     * Find zero or one TrackingUbicacion that matches the filter.
     * @param {TrackingUbicacionFindUniqueArgs} args - Arguments to find a TrackingUbicacion
     * @example
     * // Get one TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrackingUbicacionFindUniqueArgs>(args: SelectSubset<T, TrackingUbicacionFindUniqueArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TrackingUbicacion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TrackingUbicacionFindUniqueOrThrowArgs} args - Arguments to find a TrackingUbicacion
     * @example
     * // Get one TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrackingUbicacionFindUniqueOrThrowArgs>(args: SelectSubset<T, TrackingUbicacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrackingUbicacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionFindFirstArgs} args - Arguments to find a TrackingUbicacion
     * @example
     * // Get one TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrackingUbicacionFindFirstArgs>(args?: SelectSubset<T, TrackingUbicacionFindFirstArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrackingUbicacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionFindFirstOrThrowArgs} args - Arguments to find a TrackingUbicacion
     * @example
     * // Get one TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrackingUbicacionFindFirstOrThrowArgs>(args?: SelectSubset<T, TrackingUbicacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TrackingUbicacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrackingUbicacions
     * const trackingUbicacions = await prisma.trackingUbicacion.findMany()
     * 
     * // Get first 10 TrackingUbicacions
     * const trackingUbicacions = await prisma.trackingUbicacion.findMany({ take: 10 })
     * 
     * // Only select the `id_tracking`
     * const trackingUbicacionWithId_trackingOnly = await prisma.trackingUbicacion.findMany({ select: { id_tracking: true } })
     * 
     */
    findMany<T extends TrackingUbicacionFindManyArgs>(args?: SelectSubset<T, TrackingUbicacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TrackingUbicacion.
     * @param {TrackingUbicacionCreateArgs} args - Arguments to create a TrackingUbicacion.
     * @example
     * // Create one TrackingUbicacion
     * const TrackingUbicacion = await prisma.trackingUbicacion.create({
     *   data: {
     *     // ... data to create a TrackingUbicacion
     *   }
     * })
     * 
     */
    create<T extends TrackingUbicacionCreateArgs>(args: SelectSubset<T, TrackingUbicacionCreateArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TrackingUbicacions.
     * @param {TrackingUbicacionCreateManyArgs} args - Arguments to create many TrackingUbicacions.
     * @example
     * // Create many TrackingUbicacions
     * const trackingUbicacion = await prisma.trackingUbicacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrackingUbicacionCreateManyArgs>(args?: SelectSubset<T, TrackingUbicacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TrackingUbicacion.
     * @param {TrackingUbicacionDeleteArgs} args - Arguments to delete one TrackingUbicacion.
     * @example
     * // Delete one TrackingUbicacion
     * const TrackingUbicacion = await prisma.trackingUbicacion.delete({
     *   where: {
     *     // ... filter to delete one TrackingUbicacion
     *   }
     * })
     * 
     */
    delete<T extends TrackingUbicacionDeleteArgs>(args: SelectSubset<T, TrackingUbicacionDeleteArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TrackingUbicacion.
     * @param {TrackingUbicacionUpdateArgs} args - Arguments to update one TrackingUbicacion.
     * @example
     * // Update one TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrackingUbicacionUpdateArgs>(args: SelectSubset<T, TrackingUbicacionUpdateArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TrackingUbicacions.
     * @param {TrackingUbicacionDeleteManyArgs} args - Arguments to filter TrackingUbicacions to delete.
     * @example
     * // Delete a few TrackingUbicacions
     * const { count } = await prisma.trackingUbicacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrackingUbicacionDeleteManyArgs>(args?: SelectSubset<T, TrackingUbicacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrackingUbicacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrackingUbicacions
     * const trackingUbicacion = await prisma.trackingUbicacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrackingUbicacionUpdateManyArgs>(args: SelectSubset<T, TrackingUbicacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrackingUbicacion.
     * @param {TrackingUbicacionUpsertArgs} args - Arguments to update or create a TrackingUbicacion.
     * @example
     * // Update or create a TrackingUbicacion
     * const trackingUbicacion = await prisma.trackingUbicacion.upsert({
     *   create: {
     *     // ... data to create a TrackingUbicacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrackingUbicacion we want to update
     *   }
     * })
     */
    upsert<T extends TrackingUbicacionUpsertArgs>(args: SelectSubset<T, TrackingUbicacionUpsertArgs<ExtArgs>>): Prisma__TrackingUbicacionClient<$Result.GetResult<Prisma.$TrackingUbicacionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TrackingUbicacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionCountArgs} args - Arguments to filter TrackingUbicacions to count.
     * @example
     * // Count the number of TrackingUbicacions
     * const count = await prisma.trackingUbicacion.count({
     *   where: {
     *     // ... the filter for the TrackingUbicacions we want to count
     *   }
     * })
    **/
    count<T extends TrackingUbicacionCountArgs>(
      args?: Subset<T, TrackingUbicacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackingUbicacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrackingUbicacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackingUbicacionAggregateArgs>(args: Subset<T, TrackingUbicacionAggregateArgs>): Prisma.PrismaPromise<GetTrackingUbicacionAggregateType<T>>

    /**
     * Group by TrackingUbicacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackingUbicacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackingUbicacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackingUbicacionGroupByArgs['orderBy'] }
        : { orderBy?: TrackingUbicacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackingUbicacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackingUbicacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrackingUbicacion model
   */
  readonly fields: TrackingUbicacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrackingUbicacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrackingUbicacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrackingUbicacion model
   */
  interface TrackingUbicacionFieldRefs {
    readonly id_tracking: FieldRef<"TrackingUbicacion", 'BigInt'>
    readonly id_usuario: FieldRef<"TrackingUbicacion", 'String'>
    readonly latitud: FieldRef<"TrackingUbicacion", 'Decimal'>
    readonly longitud: FieldRef<"TrackingUbicacion", 'Decimal'>
    readonly precision_metros: FieldRef<"TrackingUbicacion", 'Decimal'>
    readonly registrado_en: FieldRef<"TrackingUbicacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrackingUbicacion findUnique
   */
  export type TrackingUbicacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter, which TrackingUbicacion to fetch.
     */
    where: TrackingUbicacionWhereUniqueInput
  }

  /**
   * TrackingUbicacion findUniqueOrThrow
   */
  export type TrackingUbicacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter, which TrackingUbicacion to fetch.
     */
    where: TrackingUbicacionWhereUniqueInput
  }

  /**
   * TrackingUbicacion findFirst
   */
  export type TrackingUbicacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter, which TrackingUbicacion to fetch.
     */
    where?: TrackingUbicacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackingUbicacions to fetch.
     */
    orderBy?: TrackingUbicacionOrderByWithRelationInput | TrackingUbicacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackingUbicacions.
     */
    cursor?: TrackingUbicacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackingUbicacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackingUbicacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackingUbicacions.
     */
    distinct?: TrackingUbicacionScalarFieldEnum | TrackingUbicacionScalarFieldEnum[]
  }

  /**
   * TrackingUbicacion findFirstOrThrow
   */
  export type TrackingUbicacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter, which TrackingUbicacion to fetch.
     */
    where?: TrackingUbicacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackingUbicacions to fetch.
     */
    orderBy?: TrackingUbicacionOrderByWithRelationInput | TrackingUbicacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackingUbicacions.
     */
    cursor?: TrackingUbicacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackingUbicacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackingUbicacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackingUbicacions.
     */
    distinct?: TrackingUbicacionScalarFieldEnum | TrackingUbicacionScalarFieldEnum[]
  }

  /**
   * TrackingUbicacion findMany
   */
  export type TrackingUbicacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter, which TrackingUbicacions to fetch.
     */
    where?: TrackingUbicacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackingUbicacions to fetch.
     */
    orderBy?: TrackingUbicacionOrderByWithRelationInput | TrackingUbicacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrackingUbicacions.
     */
    cursor?: TrackingUbicacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackingUbicacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackingUbicacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackingUbicacions.
     */
    distinct?: TrackingUbicacionScalarFieldEnum | TrackingUbicacionScalarFieldEnum[]
  }

  /**
   * TrackingUbicacion create
   */
  export type TrackingUbicacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * The data needed to create a TrackingUbicacion.
     */
    data: XOR<TrackingUbicacionCreateInput, TrackingUbicacionUncheckedCreateInput>
  }

  /**
   * TrackingUbicacion createMany
   */
  export type TrackingUbicacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrackingUbicacions.
     */
    data: TrackingUbicacionCreateManyInput | TrackingUbicacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TrackingUbicacion update
   */
  export type TrackingUbicacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * The data needed to update a TrackingUbicacion.
     */
    data: XOR<TrackingUbicacionUpdateInput, TrackingUbicacionUncheckedUpdateInput>
    /**
     * Choose, which TrackingUbicacion to update.
     */
    where: TrackingUbicacionWhereUniqueInput
  }

  /**
   * TrackingUbicacion updateMany
   */
  export type TrackingUbicacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrackingUbicacions.
     */
    data: XOR<TrackingUbicacionUpdateManyMutationInput, TrackingUbicacionUncheckedUpdateManyInput>
    /**
     * Filter which TrackingUbicacions to update
     */
    where?: TrackingUbicacionWhereInput
    /**
     * Limit how many TrackingUbicacions to update.
     */
    limit?: number
  }

  /**
   * TrackingUbicacion upsert
   */
  export type TrackingUbicacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * The filter to search for the TrackingUbicacion to update in case it exists.
     */
    where: TrackingUbicacionWhereUniqueInput
    /**
     * In case the TrackingUbicacion found by the `where` argument doesn't exist, create a new TrackingUbicacion with this data.
     */
    create: XOR<TrackingUbicacionCreateInput, TrackingUbicacionUncheckedCreateInput>
    /**
     * In case the TrackingUbicacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrackingUbicacionUpdateInput, TrackingUbicacionUncheckedUpdateInput>
  }

  /**
   * TrackingUbicacion delete
   */
  export type TrackingUbicacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
    /**
     * Filter which TrackingUbicacion to delete.
     */
    where: TrackingUbicacionWhereUniqueInput
  }

  /**
   * TrackingUbicacion deleteMany
   */
  export type TrackingUbicacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackingUbicacions to delete
     */
    where?: TrackingUbicacionWhereInput
    /**
     * Limit how many TrackingUbicacions to delete.
     */
    limit?: number
  }

  /**
   * TrackingUbicacion without action
   */
  export type TrackingUbicacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackingUbicacion
     */
    select?: TrackingUbicacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrackingUbicacion
     */
    omit?: TrackingUbicacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackingUbicacionInclude<ExtArgs> | null
  }


  /**
   * Model DispositivoAutorizado
   */

  export type AggregateDispositivoAutorizado = {
    _count: DispositivoAutorizadoCountAggregateOutputType | null
    _min: DispositivoAutorizadoMinAggregateOutputType | null
    _max: DispositivoAutorizadoMaxAggregateOutputType | null
  }

  export type DispositivoAutorizadoMinAggregateOutputType = {
    id_dispositivo: string | null
    id_usuario: string | null
    device_id: string | null
    nombre_dispositivo: string | null
    activo: boolean | null
    primer_uso: Date | null
    ultimo_uso: Date | null
  }

  export type DispositivoAutorizadoMaxAggregateOutputType = {
    id_dispositivo: string | null
    id_usuario: string | null
    device_id: string | null
    nombre_dispositivo: string | null
    activo: boolean | null
    primer_uso: Date | null
    ultimo_uso: Date | null
  }

  export type DispositivoAutorizadoCountAggregateOutputType = {
    id_dispositivo: number
    id_usuario: number
    device_id: number
    nombre_dispositivo: number
    activo: number
    primer_uso: number
    ultimo_uso: number
    _all: number
  }


  export type DispositivoAutorizadoMinAggregateInputType = {
    id_dispositivo?: true
    id_usuario?: true
    device_id?: true
    nombre_dispositivo?: true
    activo?: true
    primer_uso?: true
    ultimo_uso?: true
  }

  export type DispositivoAutorizadoMaxAggregateInputType = {
    id_dispositivo?: true
    id_usuario?: true
    device_id?: true
    nombre_dispositivo?: true
    activo?: true
    primer_uso?: true
    ultimo_uso?: true
  }

  export type DispositivoAutorizadoCountAggregateInputType = {
    id_dispositivo?: true
    id_usuario?: true
    device_id?: true
    nombre_dispositivo?: true
    activo?: true
    primer_uso?: true
    ultimo_uso?: true
    _all?: true
  }

  export type DispositivoAutorizadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DispositivoAutorizado to aggregate.
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispositivoAutorizados to fetch.
     */
    orderBy?: DispositivoAutorizadoOrderByWithRelationInput | DispositivoAutorizadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DispositivoAutorizadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispositivoAutorizados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispositivoAutorizados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DispositivoAutorizados
    **/
    _count?: true | DispositivoAutorizadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DispositivoAutorizadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DispositivoAutorizadoMaxAggregateInputType
  }

  export type GetDispositivoAutorizadoAggregateType<T extends DispositivoAutorizadoAggregateArgs> = {
        [P in keyof T & keyof AggregateDispositivoAutorizado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDispositivoAutorizado[P]>
      : GetScalarType<T[P], AggregateDispositivoAutorizado[P]>
  }




  export type DispositivoAutorizadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispositivoAutorizadoWhereInput
    orderBy?: DispositivoAutorizadoOrderByWithAggregationInput | DispositivoAutorizadoOrderByWithAggregationInput[]
    by: DispositivoAutorizadoScalarFieldEnum[] | DispositivoAutorizadoScalarFieldEnum
    having?: DispositivoAutorizadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DispositivoAutorizadoCountAggregateInputType | true
    _min?: DispositivoAutorizadoMinAggregateInputType
    _max?: DispositivoAutorizadoMaxAggregateInputType
  }

  export type DispositivoAutorizadoGroupByOutputType = {
    id_dispositivo: string
    id_usuario: string
    device_id: string
    nombre_dispositivo: string | null
    activo: boolean
    primer_uso: Date
    ultimo_uso: Date | null
    _count: DispositivoAutorizadoCountAggregateOutputType | null
    _min: DispositivoAutorizadoMinAggregateOutputType | null
    _max: DispositivoAutorizadoMaxAggregateOutputType | null
  }

  type GetDispositivoAutorizadoGroupByPayload<T extends DispositivoAutorizadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DispositivoAutorizadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DispositivoAutorizadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DispositivoAutorizadoGroupByOutputType[P]>
            : GetScalarType<T[P], DispositivoAutorizadoGroupByOutputType[P]>
        }
      >
    >


  export type DispositivoAutorizadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_dispositivo?: boolean
    id_usuario?: boolean
    device_id?: boolean
    nombre_dispositivo?: boolean
    activo?: boolean
    primer_uso?: boolean
    ultimo_uso?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dispositivoAutorizado"]>



  export type DispositivoAutorizadoSelectScalar = {
    id_dispositivo?: boolean
    id_usuario?: boolean
    device_id?: boolean
    nombre_dispositivo?: boolean
    activo?: boolean
    primer_uso?: boolean
    ultimo_uso?: boolean
  }

  export type DispositivoAutorizadoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_dispositivo" | "id_usuario" | "device_id" | "nombre_dispositivo" | "activo" | "primer_uso" | "ultimo_uso", ExtArgs["result"]["dispositivoAutorizado"]>
  export type DispositivoAutorizadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $DispositivoAutorizadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DispositivoAutorizado"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_dispositivo: string
      id_usuario: string
      device_id: string
      nombre_dispositivo: string | null
      activo: boolean
      primer_uso: Date
      ultimo_uso: Date | null
    }, ExtArgs["result"]["dispositivoAutorizado"]>
    composites: {}
  }

  type DispositivoAutorizadoGetPayload<S extends boolean | null | undefined | DispositivoAutorizadoDefaultArgs> = $Result.GetResult<Prisma.$DispositivoAutorizadoPayload, S>

  type DispositivoAutorizadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DispositivoAutorizadoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DispositivoAutorizadoCountAggregateInputType | true
    }

  export interface DispositivoAutorizadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DispositivoAutorizado'], meta: { name: 'DispositivoAutorizado' } }
    /**
     * Find zero or one DispositivoAutorizado that matches the filter.
     * @param {DispositivoAutorizadoFindUniqueArgs} args - Arguments to find a DispositivoAutorizado
     * @example
     * // Get one DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DispositivoAutorizadoFindUniqueArgs>(args: SelectSubset<T, DispositivoAutorizadoFindUniqueArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DispositivoAutorizado that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DispositivoAutorizadoFindUniqueOrThrowArgs} args - Arguments to find a DispositivoAutorizado
     * @example
     * // Get one DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DispositivoAutorizadoFindUniqueOrThrowArgs>(args: SelectSubset<T, DispositivoAutorizadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DispositivoAutorizado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoFindFirstArgs} args - Arguments to find a DispositivoAutorizado
     * @example
     * // Get one DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DispositivoAutorizadoFindFirstArgs>(args?: SelectSubset<T, DispositivoAutorizadoFindFirstArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DispositivoAutorizado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoFindFirstOrThrowArgs} args - Arguments to find a DispositivoAutorizado
     * @example
     * // Get one DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DispositivoAutorizadoFindFirstOrThrowArgs>(args?: SelectSubset<T, DispositivoAutorizadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DispositivoAutorizados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DispositivoAutorizados
     * const dispositivoAutorizados = await prisma.dispositivoAutorizado.findMany()
     * 
     * // Get first 10 DispositivoAutorizados
     * const dispositivoAutorizados = await prisma.dispositivoAutorizado.findMany({ take: 10 })
     * 
     * // Only select the `id_dispositivo`
     * const dispositivoAutorizadoWithId_dispositivoOnly = await prisma.dispositivoAutorizado.findMany({ select: { id_dispositivo: true } })
     * 
     */
    findMany<T extends DispositivoAutorizadoFindManyArgs>(args?: SelectSubset<T, DispositivoAutorizadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DispositivoAutorizado.
     * @param {DispositivoAutorizadoCreateArgs} args - Arguments to create a DispositivoAutorizado.
     * @example
     * // Create one DispositivoAutorizado
     * const DispositivoAutorizado = await prisma.dispositivoAutorizado.create({
     *   data: {
     *     // ... data to create a DispositivoAutorizado
     *   }
     * })
     * 
     */
    create<T extends DispositivoAutorizadoCreateArgs>(args: SelectSubset<T, DispositivoAutorizadoCreateArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DispositivoAutorizados.
     * @param {DispositivoAutorizadoCreateManyArgs} args - Arguments to create many DispositivoAutorizados.
     * @example
     * // Create many DispositivoAutorizados
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DispositivoAutorizadoCreateManyArgs>(args?: SelectSubset<T, DispositivoAutorizadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DispositivoAutorizado.
     * @param {DispositivoAutorizadoDeleteArgs} args - Arguments to delete one DispositivoAutorizado.
     * @example
     * // Delete one DispositivoAutorizado
     * const DispositivoAutorizado = await prisma.dispositivoAutorizado.delete({
     *   where: {
     *     // ... filter to delete one DispositivoAutorizado
     *   }
     * })
     * 
     */
    delete<T extends DispositivoAutorizadoDeleteArgs>(args: SelectSubset<T, DispositivoAutorizadoDeleteArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DispositivoAutorizado.
     * @param {DispositivoAutorizadoUpdateArgs} args - Arguments to update one DispositivoAutorizado.
     * @example
     * // Update one DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DispositivoAutorizadoUpdateArgs>(args: SelectSubset<T, DispositivoAutorizadoUpdateArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DispositivoAutorizados.
     * @param {DispositivoAutorizadoDeleteManyArgs} args - Arguments to filter DispositivoAutorizados to delete.
     * @example
     * // Delete a few DispositivoAutorizados
     * const { count } = await prisma.dispositivoAutorizado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DispositivoAutorizadoDeleteManyArgs>(args?: SelectSubset<T, DispositivoAutorizadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DispositivoAutorizados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DispositivoAutorizados
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DispositivoAutorizadoUpdateManyArgs>(args: SelectSubset<T, DispositivoAutorizadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DispositivoAutorizado.
     * @param {DispositivoAutorizadoUpsertArgs} args - Arguments to update or create a DispositivoAutorizado.
     * @example
     * // Update or create a DispositivoAutorizado
     * const dispositivoAutorizado = await prisma.dispositivoAutorizado.upsert({
     *   create: {
     *     // ... data to create a DispositivoAutorizado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DispositivoAutorizado we want to update
     *   }
     * })
     */
    upsert<T extends DispositivoAutorizadoUpsertArgs>(args: SelectSubset<T, DispositivoAutorizadoUpsertArgs<ExtArgs>>): Prisma__DispositivoAutorizadoClient<$Result.GetResult<Prisma.$DispositivoAutorizadoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DispositivoAutorizados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoCountArgs} args - Arguments to filter DispositivoAutorizados to count.
     * @example
     * // Count the number of DispositivoAutorizados
     * const count = await prisma.dispositivoAutorizado.count({
     *   where: {
     *     // ... the filter for the DispositivoAutorizados we want to count
     *   }
     * })
    **/
    count<T extends DispositivoAutorizadoCountArgs>(
      args?: Subset<T, DispositivoAutorizadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DispositivoAutorizadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DispositivoAutorizado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DispositivoAutorizadoAggregateArgs>(args: Subset<T, DispositivoAutorizadoAggregateArgs>): Prisma.PrismaPromise<GetDispositivoAutorizadoAggregateType<T>>

    /**
     * Group by DispositivoAutorizado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispositivoAutorizadoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DispositivoAutorizadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DispositivoAutorizadoGroupByArgs['orderBy'] }
        : { orderBy?: DispositivoAutorizadoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DispositivoAutorizadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDispositivoAutorizadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DispositivoAutorizado model
   */
  readonly fields: DispositivoAutorizadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DispositivoAutorizado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DispositivoAutorizadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DispositivoAutorizado model
   */
  interface DispositivoAutorizadoFieldRefs {
    readonly id_dispositivo: FieldRef<"DispositivoAutorizado", 'String'>
    readonly id_usuario: FieldRef<"DispositivoAutorizado", 'String'>
    readonly device_id: FieldRef<"DispositivoAutorizado", 'String'>
    readonly nombre_dispositivo: FieldRef<"DispositivoAutorizado", 'String'>
    readonly activo: FieldRef<"DispositivoAutorizado", 'Boolean'>
    readonly primer_uso: FieldRef<"DispositivoAutorizado", 'DateTime'>
    readonly ultimo_uso: FieldRef<"DispositivoAutorizado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DispositivoAutorizado findUnique
   */
  export type DispositivoAutorizadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter, which DispositivoAutorizado to fetch.
     */
    where: DispositivoAutorizadoWhereUniqueInput
  }

  /**
   * DispositivoAutorizado findUniqueOrThrow
   */
  export type DispositivoAutorizadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter, which DispositivoAutorizado to fetch.
     */
    where: DispositivoAutorizadoWhereUniqueInput
  }

  /**
   * DispositivoAutorizado findFirst
   */
  export type DispositivoAutorizadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter, which DispositivoAutorizado to fetch.
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispositivoAutorizados to fetch.
     */
    orderBy?: DispositivoAutorizadoOrderByWithRelationInput | DispositivoAutorizadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DispositivoAutorizados.
     */
    cursor?: DispositivoAutorizadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispositivoAutorizados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispositivoAutorizados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispositivoAutorizados.
     */
    distinct?: DispositivoAutorizadoScalarFieldEnum | DispositivoAutorizadoScalarFieldEnum[]
  }

  /**
   * DispositivoAutorizado findFirstOrThrow
   */
  export type DispositivoAutorizadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter, which DispositivoAutorizado to fetch.
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispositivoAutorizados to fetch.
     */
    orderBy?: DispositivoAutorizadoOrderByWithRelationInput | DispositivoAutorizadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DispositivoAutorizados.
     */
    cursor?: DispositivoAutorizadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispositivoAutorizados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispositivoAutorizados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispositivoAutorizados.
     */
    distinct?: DispositivoAutorizadoScalarFieldEnum | DispositivoAutorizadoScalarFieldEnum[]
  }

  /**
   * DispositivoAutorizado findMany
   */
  export type DispositivoAutorizadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter, which DispositivoAutorizados to fetch.
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispositivoAutorizados to fetch.
     */
    orderBy?: DispositivoAutorizadoOrderByWithRelationInput | DispositivoAutorizadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DispositivoAutorizados.
     */
    cursor?: DispositivoAutorizadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispositivoAutorizados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispositivoAutorizados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispositivoAutorizados.
     */
    distinct?: DispositivoAutorizadoScalarFieldEnum | DispositivoAutorizadoScalarFieldEnum[]
  }

  /**
   * DispositivoAutorizado create
   */
  export type DispositivoAutorizadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * The data needed to create a DispositivoAutorizado.
     */
    data: XOR<DispositivoAutorizadoCreateInput, DispositivoAutorizadoUncheckedCreateInput>
  }

  /**
   * DispositivoAutorizado createMany
   */
  export type DispositivoAutorizadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DispositivoAutorizados.
     */
    data: DispositivoAutorizadoCreateManyInput | DispositivoAutorizadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DispositivoAutorizado update
   */
  export type DispositivoAutorizadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * The data needed to update a DispositivoAutorizado.
     */
    data: XOR<DispositivoAutorizadoUpdateInput, DispositivoAutorizadoUncheckedUpdateInput>
    /**
     * Choose, which DispositivoAutorizado to update.
     */
    where: DispositivoAutorizadoWhereUniqueInput
  }

  /**
   * DispositivoAutorizado updateMany
   */
  export type DispositivoAutorizadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DispositivoAutorizados.
     */
    data: XOR<DispositivoAutorizadoUpdateManyMutationInput, DispositivoAutorizadoUncheckedUpdateManyInput>
    /**
     * Filter which DispositivoAutorizados to update
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * Limit how many DispositivoAutorizados to update.
     */
    limit?: number
  }

  /**
   * DispositivoAutorizado upsert
   */
  export type DispositivoAutorizadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * The filter to search for the DispositivoAutorizado to update in case it exists.
     */
    where: DispositivoAutorizadoWhereUniqueInput
    /**
     * In case the DispositivoAutorizado found by the `where` argument doesn't exist, create a new DispositivoAutorizado with this data.
     */
    create: XOR<DispositivoAutorizadoCreateInput, DispositivoAutorizadoUncheckedCreateInput>
    /**
     * In case the DispositivoAutorizado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DispositivoAutorizadoUpdateInput, DispositivoAutorizadoUncheckedUpdateInput>
  }

  /**
   * DispositivoAutorizado delete
   */
  export type DispositivoAutorizadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
    /**
     * Filter which DispositivoAutorizado to delete.
     */
    where: DispositivoAutorizadoWhereUniqueInput
  }

  /**
   * DispositivoAutorizado deleteMany
   */
  export type DispositivoAutorizadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DispositivoAutorizados to delete
     */
    where?: DispositivoAutorizadoWhereInput
    /**
     * Limit how many DispositivoAutorizados to delete.
     */
    limit?: number
  }

  /**
   * DispositivoAutorizado without action
   */
  export type DispositivoAutorizadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispositivoAutorizado
     */
    select?: DispositivoAutorizadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispositivoAutorizado
     */
    omit?: DispositivoAutorizadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispositivoAutorizadoInclude<ExtArgs> | null
  }


  /**
   * Model Expediente
   */

  export type AggregateExpediente = {
    _count: ExpedienteCountAggregateOutputType | null
    _avg: ExpedienteAvgAggregateOutputType | null
    _sum: ExpedienteSumAggregateOutputType | null
    _min: ExpedienteMinAggregateOutputType | null
    _max: ExpedienteMaxAggregateOutputType | null
  }

  export type ExpedienteAvgAggregateOutputType = {
    id_expediente: number | null
    latitud: Decimal | null
    longitud: Decimal | null
    monto_desembolso: Decimal | null
  }

  export type ExpedienteSumAggregateOutputType = {
    id_expediente: number | null
    latitud: Decimal | null
    longitud: Decimal | null
    monto_desembolso: Decimal | null
  }

  export type ExpedienteMinAggregateOutputType = {
    id_expediente: number | null
    codigo_expediente: string | null
    tipo_credito: $Enums.TipoCredito | null
    oficina: string | null
    tipo_documento_cliente: $Enums.TipoDocumento | null
    numero_documento_cliente: string | null
    nombres_cliente: string | null
    telefono_cliente: string | null
    direccion_domicilio: string | null
    distrito: string | null
    provincia: string | null
    departamento: string | null
    latitud: Decimal | null
    longitud: Decimal | null
    asesor_responsable: string | null
    monto_desembolso: Decimal | null
    moneda: string | null
    estado: string | null
    fecha_creacion: Date | null
    fecha_actualizar: Date | null
  }

  export type ExpedienteMaxAggregateOutputType = {
    id_expediente: number | null
    codigo_expediente: string | null
    tipo_credito: $Enums.TipoCredito | null
    oficina: string | null
    tipo_documento_cliente: $Enums.TipoDocumento | null
    numero_documento_cliente: string | null
    nombres_cliente: string | null
    telefono_cliente: string | null
    direccion_domicilio: string | null
    distrito: string | null
    provincia: string | null
    departamento: string | null
    latitud: Decimal | null
    longitud: Decimal | null
    asesor_responsable: string | null
    monto_desembolso: Decimal | null
    moneda: string | null
    estado: string | null
    fecha_creacion: Date | null
    fecha_actualizar: Date | null
  }

  export type ExpedienteCountAggregateOutputType = {
    id_expediente: number
    codigo_expediente: number
    tipo_credito: number
    oficina: number
    tipo_documento_cliente: number
    numero_documento_cliente: number
    nombres_cliente: number
    telefono_cliente: number
    direccion_domicilio: number
    distrito: number
    provincia: number
    departamento: number
    latitud: number
    longitud: number
    asesor_responsable: number
    monto_desembolso: number
    moneda: number
    datos_cliente: number
    datos_negocio: number
    datos_credito: number
    evaluacion_financiera: number
    endeudamiento: number
    estado: number
    fecha_creacion: number
    fecha_actualizar: number
    _all: number
  }


  export type ExpedienteAvgAggregateInputType = {
    id_expediente?: true
    latitud?: true
    longitud?: true
    monto_desembolso?: true
  }

  export type ExpedienteSumAggregateInputType = {
    id_expediente?: true
    latitud?: true
    longitud?: true
    monto_desembolso?: true
  }

  export type ExpedienteMinAggregateInputType = {
    id_expediente?: true
    codigo_expediente?: true
    tipo_credito?: true
    oficina?: true
    tipo_documento_cliente?: true
    numero_documento_cliente?: true
    nombres_cliente?: true
    telefono_cliente?: true
    direccion_domicilio?: true
    distrito?: true
    provincia?: true
    departamento?: true
    latitud?: true
    longitud?: true
    asesor_responsable?: true
    monto_desembolso?: true
    moneda?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
  }

  export type ExpedienteMaxAggregateInputType = {
    id_expediente?: true
    codigo_expediente?: true
    tipo_credito?: true
    oficina?: true
    tipo_documento_cliente?: true
    numero_documento_cliente?: true
    nombres_cliente?: true
    telefono_cliente?: true
    direccion_domicilio?: true
    distrito?: true
    provincia?: true
    departamento?: true
    latitud?: true
    longitud?: true
    asesor_responsable?: true
    monto_desembolso?: true
    moneda?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
  }

  export type ExpedienteCountAggregateInputType = {
    id_expediente?: true
    codigo_expediente?: true
    tipo_credito?: true
    oficina?: true
    tipo_documento_cliente?: true
    numero_documento_cliente?: true
    nombres_cliente?: true
    telefono_cliente?: true
    direccion_domicilio?: true
    distrito?: true
    provincia?: true
    departamento?: true
    latitud?: true
    longitud?: true
    asesor_responsable?: true
    monto_desembolso?: true
    moneda?: true
    datos_cliente?: true
    datos_negocio?: true
    datos_credito?: true
    evaluacion_financiera?: true
    endeudamiento?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
    _all?: true
  }

  export type ExpedienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expediente to aggregate.
     */
    where?: ExpedienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expedientes to fetch.
     */
    orderBy?: ExpedienteOrderByWithRelationInput | ExpedienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExpedienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expedientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expedientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Expedientes
    **/
    _count?: true | ExpedienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExpedienteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExpedienteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExpedienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExpedienteMaxAggregateInputType
  }

  export type GetExpedienteAggregateType<T extends ExpedienteAggregateArgs> = {
        [P in keyof T & keyof AggregateExpediente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExpediente[P]>
      : GetScalarType<T[P], AggregateExpediente[P]>
  }




  export type ExpedienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpedienteWhereInput
    orderBy?: ExpedienteOrderByWithAggregationInput | ExpedienteOrderByWithAggregationInput[]
    by: ExpedienteScalarFieldEnum[] | ExpedienteScalarFieldEnum
    having?: ExpedienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExpedienteCountAggregateInputType | true
    _avg?: ExpedienteAvgAggregateInputType
    _sum?: ExpedienteSumAggregateInputType
    _min?: ExpedienteMinAggregateInputType
    _max?: ExpedienteMaxAggregateInputType
  }

  export type ExpedienteGroupByOutputType = {
    id_expediente: number
    codigo_expediente: string
    tipo_credito: $Enums.TipoCredito
    oficina: string | null
    tipo_documento_cliente: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente: string | null
    direccion_domicilio: string | null
    distrito: string | null
    provincia: string | null
    departamento: string | null
    latitud: Decimal | null
    longitud: Decimal | null
    asesor_responsable: string
    monto_desembolso: Decimal | null
    moneda: string | null
    datos_cliente: JsonValue | null
    datos_negocio: JsonValue | null
    datos_credito: JsonValue | null
    evaluacion_financiera: JsonValue | null
    endeudamiento: JsonValue | null
    estado: string
    fecha_creacion: Date
    fecha_actualizar: Date
    _count: ExpedienteCountAggregateOutputType | null
    _avg: ExpedienteAvgAggregateOutputType | null
    _sum: ExpedienteSumAggregateOutputType | null
    _min: ExpedienteMinAggregateOutputType | null
    _max: ExpedienteMaxAggregateOutputType | null
  }

  type GetExpedienteGroupByPayload<T extends ExpedienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExpedienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExpedienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExpedienteGroupByOutputType[P]>
            : GetScalarType<T[P], ExpedienteGroupByOutputType[P]>
        }
      >
    >


  export type ExpedienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_expediente?: boolean
    codigo_expediente?: boolean
    tipo_credito?: boolean
    oficina?: boolean
    tipo_documento_cliente?: boolean
    numero_documento_cliente?: boolean
    nombres_cliente?: boolean
    telefono_cliente?: boolean
    direccion_domicilio?: boolean
    distrito?: boolean
    provincia?: boolean
    departamento?: boolean
    latitud?: boolean
    longitud?: boolean
    asesor_responsable?: boolean
    monto_desembolso?: boolean
    moneda?: boolean
    datos_cliente?: boolean
    datos_negocio?: boolean
    datos_credito?: boolean
    evaluacion_financiera?: boolean
    endeudamiento?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    fecha_actualizar?: boolean
    asignaciones?: boolean | Expediente$asignacionesArgs<ExtArgs>
    visitas?: boolean | Expediente$visitasArgs<ExtArgs>
    _count?: boolean | ExpedienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expediente"]>



  export type ExpedienteSelectScalar = {
    id_expediente?: boolean
    codigo_expediente?: boolean
    tipo_credito?: boolean
    oficina?: boolean
    tipo_documento_cliente?: boolean
    numero_documento_cliente?: boolean
    nombres_cliente?: boolean
    telefono_cliente?: boolean
    direccion_domicilio?: boolean
    distrito?: boolean
    provincia?: boolean
    departamento?: boolean
    latitud?: boolean
    longitud?: boolean
    asesor_responsable?: boolean
    monto_desembolso?: boolean
    moneda?: boolean
    datos_cliente?: boolean
    datos_negocio?: boolean
    datos_credito?: boolean
    evaluacion_financiera?: boolean
    endeudamiento?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    fecha_actualizar?: boolean
  }

  export type ExpedienteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_expediente" | "codigo_expediente" | "tipo_credito" | "oficina" | "tipo_documento_cliente" | "numero_documento_cliente" | "nombres_cliente" | "telefono_cliente" | "direccion_domicilio" | "distrito" | "provincia" | "departamento" | "latitud" | "longitud" | "asesor_responsable" | "monto_desembolso" | "moneda" | "datos_cliente" | "datos_negocio" | "datos_credito" | "evaluacion_financiera" | "endeudamiento" | "estado" | "fecha_creacion" | "fecha_actualizar", ExtArgs["result"]["expediente"]>
  export type ExpedienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | Expediente$asignacionesArgs<ExtArgs>
    visitas?: boolean | Expediente$visitasArgs<ExtArgs>
    _count?: boolean | ExpedienteCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ExpedientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Expediente"
    objects: {
      asignaciones: Prisma.$AsignacionAuditoriaPayload<ExtArgs>[]
      visitas: Prisma.$VisitaAuditoriaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_expediente: number
      codigo_expediente: string
      tipo_credito: $Enums.TipoCredito
      oficina: string | null
      tipo_documento_cliente: $Enums.TipoDocumento
      numero_documento_cliente: string
      nombres_cliente: string
      telefono_cliente: string | null
      direccion_domicilio: string | null
      distrito: string | null
      provincia: string | null
      departamento: string | null
      latitud: Prisma.Decimal | null
      longitud: Prisma.Decimal | null
      asesor_responsable: string
      monto_desembolso: Prisma.Decimal | null
      moneda: string | null
      datos_cliente: Prisma.JsonValue | null
      datos_negocio: Prisma.JsonValue | null
      datos_credito: Prisma.JsonValue | null
      evaluacion_financiera: Prisma.JsonValue | null
      endeudamiento: Prisma.JsonValue | null
      estado: string
      fecha_creacion: Date
      fecha_actualizar: Date
    }, ExtArgs["result"]["expediente"]>
    composites: {}
  }

  type ExpedienteGetPayload<S extends boolean | null | undefined | ExpedienteDefaultArgs> = $Result.GetResult<Prisma.$ExpedientePayload, S>

  type ExpedienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExpedienteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExpedienteCountAggregateInputType | true
    }

  export interface ExpedienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Expediente'], meta: { name: 'Expediente' } }
    /**
     * Find zero or one Expediente that matches the filter.
     * @param {ExpedienteFindUniqueArgs} args - Arguments to find a Expediente
     * @example
     * // Get one Expediente
     * const expediente = await prisma.expediente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExpedienteFindUniqueArgs>(args: SelectSubset<T, ExpedienteFindUniqueArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Expediente that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExpedienteFindUniqueOrThrowArgs} args - Arguments to find a Expediente
     * @example
     * // Get one Expediente
     * const expediente = await prisma.expediente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExpedienteFindUniqueOrThrowArgs>(args: SelectSubset<T, ExpedienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expediente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteFindFirstArgs} args - Arguments to find a Expediente
     * @example
     * // Get one Expediente
     * const expediente = await prisma.expediente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExpedienteFindFirstArgs>(args?: SelectSubset<T, ExpedienteFindFirstArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expediente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteFindFirstOrThrowArgs} args - Arguments to find a Expediente
     * @example
     * // Get one Expediente
     * const expediente = await prisma.expediente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExpedienteFindFirstOrThrowArgs>(args?: SelectSubset<T, ExpedienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Expedientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Expedientes
     * const expedientes = await prisma.expediente.findMany()
     * 
     * // Get first 10 Expedientes
     * const expedientes = await prisma.expediente.findMany({ take: 10 })
     * 
     * // Only select the `id_expediente`
     * const expedienteWithId_expedienteOnly = await prisma.expediente.findMany({ select: { id_expediente: true } })
     * 
     */
    findMany<T extends ExpedienteFindManyArgs>(args?: SelectSubset<T, ExpedienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Expediente.
     * @param {ExpedienteCreateArgs} args - Arguments to create a Expediente.
     * @example
     * // Create one Expediente
     * const Expediente = await prisma.expediente.create({
     *   data: {
     *     // ... data to create a Expediente
     *   }
     * })
     * 
     */
    create<T extends ExpedienteCreateArgs>(args: SelectSubset<T, ExpedienteCreateArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Expedientes.
     * @param {ExpedienteCreateManyArgs} args - Arguments to create many Expedientes.
     * @example
     * // Create many Expedientes
     * const expediente = await prisma.expediente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExpedienteCreateManyArgs>(args?: SelectSubset<T, ExpedienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Expediente.
     * @param {ExpedienteDeleteArgs} args - Arguments to delete one Expediente.
     * @example
     * // Delete one Expediente
     * const Expediente = await prisma.expediente.delete({
     *   where: {
     *     // ... filter to delete one Expediente
     *   }
     * })
     * 
     */
    delete<T extends ExpedienteDeleteArgs>(args: SelectSubset<T, ExpedienteDeleteArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Expediente.
     * @param {ExpedienteUpdateArgs} args - Arguments to update one Expediente.
     * @example
     * // Update one Expediente
     * const expediente = await prisma.expediente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExpedienteUpdateArgs>(args: SelectSubset<T, ExpedienteUpdateArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Expedientes.
     * @param {ExpedienteDeleteManyArgs} args - Arguments to filter Expedientes to delete.
     * @example
     * // Delete a few Expedientes
     * const { count } = await prisma.expediente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExpedienteDeleteManyArgs>(args?: SelectSubset<T, ExpedienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expedientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Expedientes
     * const expediente = await prisma.expediente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExpedienteUpdateManyArgs>(args: SelectSubset<T, ExpedienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Expediente.
     * @param {ExpedienteUpsertArgs} args - Arguments to update or create a Expediente.
     * @example
     * // Update or create a Expediente
     * const expediente = await prisma.expediente.upsert({
     *   create: {
     *     // ... data to create a Expediente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Expediente we want to update
     *   }
     * })
     */
    upsert<T extends ExpedienteUpsertArgs>(args: SelectSubset<T, ExpedienteUpsertArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Expedientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteCountArgs} args - Arguments to filter Expedientes to count.
     * @example
     * // Count the number of Expedientes
     * const count = await prisma.expediente.count({
     *   where: {
     *     // ... the filter for the Expedientes we want to count
     *   }
     * })
    **/
    count<T extends ExpedienteCountArgs>(
      args?: Subset<T, ExpedienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExpedienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Expediente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExpedienteAggregateArgs>(args: Subset<T, ExpedienteAggregateArgs>): Prisma.PrismaPromise<GetExpedienteAggregateType<T>>

    /**
     * Group by Expediente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpedienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExpedienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExpedienteGroupByArgs['orderBy'] }
        : { orderBy?: ExpedienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExpedienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpedienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Expediente model
   */
  readonly fields: ExpedienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Expediente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExpedienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asignaciones<T extends Expediente$asignacionesArgs<ExtArgs> = {}>(args?: Subset<T, Expediente$asignacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    visitas<T extends Expediente$visitasArgs<ExtArgs> = {}>(args?: Subset<T, Expediente$visitasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Expediente model
   */
  interface ExpedienteFieldRefs {
    readonly id_expediente: FieldRef<"Expediente", 'Int'>
    readonly codigo_expediente: FieldRef<"Expediente", 'String'>
    readonly tipo_credito: FieldRef<"Expediente", 'TipoCredito'>
    readonly oficina: FieldRef<"Expediente", 'String'>
    readonly tipo_documento_cliente: FieldRef<"Expediente", 'TipoDocumento'>
    readonly numero_documento_cliente: FieldRef<"Expediente", 'String'>
    readonly nombres_cliente: FieldRef<"Expediente", 'String'>
    readonly telefono_cliente: FieldRef<"Expediente", 'String'>
    readonly direccion_domicilio: FieldRef<"Expediente", 'String'>
    readonly distrito: FieldRef<"Expediente", 'String'>
    readonly provincia: FieldRef<"Expediente", 'String'>
    readonly departamento: FieldRef<"Expediente", 'String'>
    readonly latitud: FieldRef<"Expediente", 'Decimal'>
    readonly longitud: FieldRef<"Expediente", 'Decimal'>
    readonly asesor_responsable: FieldRef<"Expediente", 'String'>
    readonly monto_desembolso: FieldRef<"Expediente", 'Decimal'>
    readonly moneda: FieldRef<"Expediente", 'String'>
    readonly datos_cliente: FieldRef<"Expediente", 'Json'>
    readonly datos_negocio: FieldRef<"Expediente", 'Json'>
    readonly datos_credito: FieldRef<"Expediente", 'Json'>
    readonly evaluacion_financiera: FieldRef<"Expediente", 'Json'>
    readonly endeudamiento: FieldRef<"Expediente", 'Json'>
    readonly estado: FieldRef<"Expediente", 'String'>
    readonly fecha_creacion: FieldRef<"Expediente", 'DateTime'>
    readonly fecha_actualizar: FieldRef<"Expediente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Expediente findUnique
   */
  export type ExpedienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter, which Expediente to fetch.
     */
    where: ExpedienteWhereUniqueInput
  }

  /**
   * Expediente findUniqueOrThrow
   */
  export type ExpedienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter, which Expediente to fetch.
     */
    where: ExpedienteWhereUniqueInput
  }

  /**
   * Expediente findFirst
   */
  export type ExpedienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter, which Expediente to fetch.
     */
    where?: ExpedienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expedientes to fetch.
     */
    orderBy?: ExpedienteOrderByWithRelationInput | ExpedienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expedientes.
     */
    cursor?: ExpedienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expedientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expedientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expedientes.
     */
    distinct?: ExpedienteScalarFieldEnum | ExpedienteScalarFieldEnum[]
  }

  /**
   * Expediente findFirstOrThrow
   */
  export type ExpedienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter, which Expediente to fetch.
     */
    where?: ExpedienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expedientes to fetch.
     */
    orderBy?: ExpedienteOrderByWithRelationInput | ExpedienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expedientes.
     */
    cursor?: ExpedienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expedientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expedientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expedientes.
     */
    distinct?: ExpedienteScalarFieldEnum | ExpedienteScalarFieldEnum[]
  }

  /**
   * Expediente findMany
   */
  export type ExpedienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter, which Expedientes to fetch.
     */
    where?: ExpedienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expedientes to fetch.
     */
    orderBy?: ExpedienteOrderByWithRelationInput | ExpedienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Expedientes.
     */
    cursor?: ExpedienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expedientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expedientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expedientes.
     */
    distinct?: ExpedienteScalarFieldEnum | ExpedienteScalarFieldEnum[]
  }

  /**
   * Expediente create
   */
  export type ExpedienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Expediente.
     */
    data: XOR<ExpedienteCreateInput, ExpedienteUncheckedCreateInput>
  }

  /**
   * Expediente createMany
   */
  export type ExpedienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Expedientes.
     */
    data: ExpedienteCreateManyInput | ExpedienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Expediente update
   */
  export type ExpedienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Expediente.
     */
    data: XOR<ExpedienteUpdateInput, ExpedienteUncheckedUpdateInput>
    /**
     * Choose, which Expediente to update.
     */
    where: ExpedienteWhereUniqueInput
  }

  /**
   * Expediente updateMany
   */
  export type ExpedienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Expedientes.
     */
    data: XOR<ExpedienteUpdateManyMutationInput, ExpedienteUncheckedUpdateManyInput>
    /**
     * Filter which Expedientes to update
     */
    where?: ExpedienteWhereInput
    /**
     * Limit how many Expedientes to update.
     */
    limit?: number
  }

  /**
   * Expediente upsert
   */
  export type ExpedienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Expediente to update in case it exists.
     */
    where: ExpedienteWhereUniqueInput
    /**
     * In case the Expediente found by the `where` argument doesn't exist, create a new Expediente with this data.
     */
    create: XOR<ExpedienteCreateInput, ExpedienteUncheckedCreateInput>
    /**
     * In case the Expediente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExpedienteUpdateInput, ExpedienteUncheckedUpdateInput>
  }

  /**
   * Expediente delete
   */
  export type ExpedienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
    /**
     * Filter which Expediente to delete.
     */
    where: ExpedienteWhereUniqueInput
  }

  /**
   * Expediente deleteMany
   */
  export type ExpedienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expedientes to delete
     */
    where?: ExpedienteWhereInput
    /**
     * Limit how many Expedientes to delete.
     */
    limit?: number
  }

  /**
   * Expediente.asignaciones
   */
  export type Expediente$asignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    where?: AsignacionAuditoriaWhereInput
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    cursor?: AsignacionAuditoriaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AsignacionAuditoriaScalarFieldEnum | AsignacionAuditoriaScalarFieldEnum[]
  }

  /**
   * Expediente.visitas
   */
  export type Expediente$visitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    where?: VisitaAuditoriaWhereInput
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    cursor?: VisitaAuditoriaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VisitaAuditoriaScalarFieldEnum | VisitaAuditoriaScalarFieldEnum[]
  }

  /**
   * Expediente without action
   */
  export type ExpedienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expediente
     */
    select?: ExpedienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expediente
     */
    omit?: ExpedienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpedienteInclude<ExtArgs> | null
  }


  /**
   * Model AsignacionAuditoria
   */

  export type AggregateAsignacionAuditoria = {
    _count: AsignacionAuditoriaCountAggregateOutputType | null
    _avg: AsignacionAuditoriaAvgAggregateOutputType | null
    _sum: AsignacionAuditoriaSumAggregateOutputType | null
    _min: AsignacionAuditoriaMinAggregateOutputType | null
    _max: AsignacionAuditoriaMaxAggregateOutputType | null
  }

  export type AsignacionAuditoriaAvgAggregateOutputType = {
    id_asignacion: number | null
    id_expediente: number | null
  }

  export type AsignacionAuditoriaSumAggregateOutputType = {
    id_asignacion: number | null
    id_expediente: number | null
  }

  export type AsignacionAuditoriaMinAggregateOutputType = {
    id_asignacion: number | null
    id_expediente: number | null
    id_usuario_auditor: string | null
    fecha_asignacion: Date | null
    fecha_fin: Date | null
    estado: string | null
    prioridad: string | null
  }

  export type AsignacionAuditoriaMaxAggregateOutputType = {
    id_asignacion: number | null
    id_expediente: number | null
    id_usuario_auditor: string | null
    fecha_asignacion: Date | null
    fecha_fin: Date | null
    estado: string | null
    prioridad: string | null
  }

  export type AsignacionAuditoriaCountAggregateOutputType = {
    id_asignacion: number
    id_expediente: number
    id_usuario_auditor: number
    fecha_asignacion: number
    fecha_fin: number
    estado: number
    prioridad: number
    _all: number
  }


  export type AsignacionAuditoriaAvgAggregateInputType = {
    id_asignacion?: true
    id_expediente?: true
  }

  export type AsignacionAuditoriaSumAggregateInputType = {
    id_asignacion?: true
    id_expediente?: true
  }

  export type AsignacionAuditoriaMinAggregateInputType = {
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_asignacion?: true
    fecha_fin?: true
    estado?: true
    prioridad?: true
  }

  export type AsignacionAuditoriaMaxAggregateInputType = {
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_asignacion?: true
    fecha_fin?: true
    estado?: true
    prioridad?: true
  }

  export type AsignacionAuditoriaCountAggregateInputType = {
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_asignacion?: true
    fecha_fin?: true
    estado?: true
    prioridad?: true
    _all?: true
  }

  export type AsignacionAuditoriaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsignacionAuditoria to aggregate.
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionAuditorias to fetch.
     */
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AsignacionAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AsignacionAuditorias
    **/
    _count?: true | AsignacionAuditoriaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AsignacionAuditoriaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AsignacionAuditoriaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AsignacionAuditoriaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AsignacionAuditoriaMaxAggregateInputType
  }

  export type GetAsignacionAuditoriaAggregateType<T extends AsignacionAuditoriaAggregateArgs> = {
        [P in keyof T & keyof AggregateAsignacionAuditoria]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsignacionAuditoria[P]>
      : GetScalarType<T[P], AggregateAsignacionAuditoria[P]>
  }




  export type AsignacionAuditoriaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionAuditoriaWhereInput
    orderBy?: AsignacionAuditoriaOrderByWithAggregationInput | AsignacionAuditoriaOrderByWithAggregationInput[]
    by: AsignacionAuditoriaScalarFieldEnum[] | AsignacionAuditoriaScalarFieldEnum
    having?: AsignacionAuditoriaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AsignacionAuditoriaCountAggregateInputType | true
    _avg?: AsignacionAuditoriaAvgAggregateInputType
    _sum?: AsignacionAuditoriaSumAggregateInputType
    _min?: AsignacionAuditoriaMinAggregateInputType
    _max?: AsignacionAuditoriaMaxAggregateInputType
  }

  export type AsignacionAuditoriaGroupByOutputType = {
    id_asignacion: number
    id_expediente: number
    id_usuario_auditor: string
    fecha_asignacion: Date
    fecha_fin: Date | null
    estado: string
    prioridad: string
    _count: AsignacionAuditoriaCountAggregateOutputType | null
    _avg: AsignacionAuditoriaAvgAggregateOutputType | null
    _sum: AsignacionAuditoriaSumAggregateOutputType | null
    _min: AsignacionAuditoriaMinAggregateOutputType | null
    _max: AsignacionAuditoriaMaxAggregateOutputType | null
  }

  type GetAsignacionAuditoriaGroupByPayload<T extends AsignacionAuditoriaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AsignacionAuditoriaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AsignacionAuditoriaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AsignacionAuditoriaGroupByOutputType[P]>
            : GetScalarType<T[P], AsignacionAuditoriaGroupByOutputType[P]>
        }
      >
    >


  export type AsignacionAuditoriaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_asignacion?: boolean
    id_expediente?: boolean
    id_usuario_auditor?: boolean
    fecha_asignacion?: boolean
    fecha_fin?: boolean
    estado?: boolean
    prioridad?: boolean
    expediente?: boolean | ExpedienteDefaultArgs<ExtArgs>
    auditor?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asignacionAuditoria"]>



  export type AsignacionAuditoriaSelectScalar = {
    id_asignacion?: boolean
    id_expediente?: boolean
    id_usuario_auditor?: boolean
    fecha_asignacion?: boolean
    fecha_fin?: boolean
    estado?: boolean
    prioridad?: boolean
  }

  export type AsignacionAuditoriaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_asignacion" | "id_expediente" | "id_usuario_auditor" | "fecha_asignacion" | "fecha_fin" | "estado" | "prioridad", ExtArgs["result"]["asignacionAuditoria"]>
  export type AsignacionAuditoriaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    expediente?: boolean | ExpedienteDefaultArgs<ExtArgs>
    auditor?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $AsignacionAuditoriaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AsignacionAuditoria"
    objects: {
      expediente: Prisma.$ExpedientePayload<ExtArgs>
      auditor: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_asignacion: number
      id_expediente: number
      id_usuario_auditor: string
      fecha_asignacion: Date
      fecha_fin: Date | null
      estado: string
      prioridad: string
    }, ExtArgs["result"]["asignacionAuditoria"]>
    composites: {}
  }

  type AsignacionAuditoriaGetPayload<S extends boolean | null | undefined | AsignacionAuditoriaDefaultArgs> = $Result.GetResult<Prisma.$AsignacionAuditoriaPayload, S>

  type AsignacionAuditoriaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AsignacionAuditoriaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AsignacionAuditoriaCountAggregateInputType | true
    }

  export interface AsignacionAuditoriaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AsignacionAuditoria'], meta: { name: 'AsignacionAuditoria' } }
    /**
     * Find zero or one AsignacionAuditoria that matches the filter.
     * @param {AsignacionAuditoriaFindUniqueArgs} args - Arguments to find a AsignacionAuditoria
     * @example
     * // Get one AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AsignacionAuditoriaFindUniqueArgs>(args: SelectSubset<T, AsignacionAuditoriaFindUniqueArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AsignacionAuditoria that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AsignacionAuditoriaFindUniqueOrThrowArgs} args - Arguments to find a AsignacionAuditoria
     * @example
     * // Get one AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AsignacionAuditoriaFindUniqueOrThrowArgs>(args: SelectSubset<T, AsignacionAuditoriaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AsignacionAuditoria that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaFindFirstArgs} args - Arguments to find a AsignacionAuditoria
     * @example
     * // Get one AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AsignacionAuditoriaFindFirstArgs>(args?: SelectSubset<T, AsignacionAuditoriaFindFirstArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AsignacionAuditoria that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaFindFirstOrThrowArgs} args - Arguments to find a AsignacionAuditoria
     * @example
     * // Get one AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AsignacionAuditoriaFindFirstOrThrowArgs>(args?: SelectSubset<T, AsignacionAuditoriaFindFirstOrThrowArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AsignacionAuditorias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AsignacionAuditorias
     * const asignacionAuditorias = await prisma.asignacionAuditoria.findMany()
     * 
     * // Get first 10 AsignacionAuditorias
     * const asignacionAuditorias = await prisma.asignacionAuditoria.findMany({ take: 10 })
     * 
     * // Only select the `id_asignacion`
     * const asignacionAuditoriaWithId_asignacionOnly = await prisma.asignacionAuditoria.findMany({ select: { id_asignacion: true } })
     * 
     */
    findMany<T extends AsignacionAuditoriaFindManyArgs>(args?: SelectSubset<T, AsignacionAuditoriaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AsignacionAuditoria.
     * @param {AsignacionAuditoriaCreateArgs} args - Arguments to create a AsignacionAuditoria.
     * @example
     * // Create one AsignacionAuditoria
     * const AsignacionAuditoria = await prisma.asignacionAuditoria.create({
     *   data: {
     *     // ... data to create a AsignacionAuditoria
     *   }
     * })
     * 
     */
    create<T extends AsignacionAuditoriaCreateArgs>(args: SelectSubset<T, AsignacionAuditoriaCreateArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AsignacionAuditorias.
     * @param {AsignacionAuditoriaCreateManyArgs} args - Arguments to create many AsignacionAuditorias.
     * @example
     * // Create many AsignacionAuditorias
     * const asignacionAuditoria = await prisma.asignacionAuditoria.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AsignacionAuditoriaCreateManyArgs>(args?: SelectSubset<T, AsignacionAuditoriaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AsignacionAuditoria.
     * @param {AsignacionAuditoriaDeleteArgs} args - Arguments to delete one AsignacionAuditoria.
     * @example
     * // Delete one AsignacionAuditoria
     * const AsignacionAuditoria = await prisma.asignacionAuditoria.delete({
     *   where: {
     *     // ... filter to delete one AsignacionAuditoria
     *   }
     * })
     * 
     */
    delete<T extends AsignacionAuditoriaDeleteArgs>(args: SelectSubset<T, AsignacionAuditoriaDeleteArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AsignacionAuditoria.
     * @param {AsignacionAuditoriaUpdateArgs} args - Arguments to update one AsignacionAuditoria.
     * @example
     * // Update one AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AsignacionAuditoriaUpdateArgs>(args: SelectSubset<T, AsignacionAuditoriaUpdateArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AsignacionAuditorias.
     * @param {AsignacionAuditoriaDeleteManyArgs} args - Arguments to filter AsignacionAuditorias to delete.
     * @example
     * // Delete a few AsignacionAuditorias
     * const { count } = await prisma.asignacionAuditoria.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AsignacionAuditoriaDeleteManyArgs>(args?: SelectSubset<T, AsignacionAuditoriaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AsignacionAuditorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AsignacionAuditorias
     * const asignacionAuditoria = await prisma.asignacionAuditoria.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AsignacionAuditoriaUpdateManyArgs>(args: SelectSubset<T, AsignacionAuditoriaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AsignacionAuditoria.
     * @param {AsignacionAuditoriaUpsertArgs} args - Arguments to update or create a AsignacionAuditoria.
     * @example
     * // Update or create a AsignacionAuditoria
     * const asignacionAuditoria = await prisma.asignacionAuditoria.upsert({
     *   create: {
     *     // ... data to create a AsignacionAuditoria
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AsignacionAuditoria we want to update
     *   }
     * })
     */
    upsert<T extends AsignacionAuditoriaUpsertArgs>(args: SelectSubset<T, AsignacionAuditoriaUpsertArgs<ExtArgs>>): Prisma__AsignacionAuditoriaClient<$Result.GetResult<Prisma.$AsignacionAuditoriaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AsignacionAuditorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaCountArgs} args - Arguments to filter AsignacionAuditorias to count.
     * @example
     * // Count the number of AsignacionAuditorias
     * const count = await prisma.asignacionAuditoria.count({
     *   where: {
     *     // ... the filter for the AsignacionAuditorias we want to count
     *   }
     * })
    **/
    count<T extends AsignacionAuditoriaCountArgs>(
      args?: Subset<T, AsignacionAuditoriaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AsignacionAuditoriaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AsignacionAuditoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AsignacionAuditoriaAggregateArgs>(args: Subset<T, AsignacionAuditoriaAggregateArgs>): Prisma.PrismaPromise<GetAsignacionAuditoriaAggregateType<T>>

    /**
     * Group by AsignacionAuditoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionAuditoriaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AsignacionAuditoriaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AsignacionAuditoriaGroupByArgs['orderBy'] }
        : { orderBy?: AsignacionAuditoriaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AsignacionAuditoriaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAsignacionAuditoriaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AsignacionAuditoria model
   */
  readonly fields: AsignacionAuditoriaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AsignacionAuditoria.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AsignacionAuditoriaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    expediente<T extends ExpedienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExpedienteDefaultArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    auditor<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AsignacionAuditoria model
   */
  interface AsignacionAuditoriaFieldRefs {
    readonly id_asignacion: FieldRef<"AsignacionAuditoria", 'Int'>
    readonly id_expediente: FieldRef<"AsignacionAuditoria", 'Int'>
    readonly id_usuario_auditor: FieldRef<"AsignacionAuditoria", 'String'>
    readonly fecha_asignacion: FieldRef<"AsignacionAuditoria", 'DateTime'>
    readonly fecha_fin: FieldRef<"AsignacionAuditoria", 'DateTime'>
    readonly estado: FieldRef<"AsignacionAuditoria", 'String'>
    readonly prioridad: FieldRef<"AsignacionAuditoria", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AsignacionAuditoria findUnique
   */
  export type AsignacionAuditoriaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionAuditoria to fetch.
     */
    where: AsignacionAuditoriaWhereUniqueInput
  }

  /**
   * AsignacionAuditoria findUniqueOrThrow
   */
  export type AsignacionAuditoriaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionAuditoria to fetch.
     */
    where: AsignacionAuditoriaWhereUniqueInput
  }

  /**
   * AsignacionAuditoria findFirst
   */
  export type AsignacionAuditoriaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionAuditoria to fetch.
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionAuditorias to fetch.
     */
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsignacionAuditorias.
     */
    cursor?: AsignacionAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsignacionAuditorias.
     */
    distinct?: AsignacionAuditoriaScalarFieldEnum | AsignacionAuditoriaScalarFieldEnum[]
  }

  /**
   * AsignacionAuditoria findFirstOrThrow
   */
  export type AsignacionAuditoriaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionAuditoria to fetch.
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionAuditorias to fetch.
     */
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsignacionAuditorias.
     */
    cursor?: AsignacionAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsignacionAuditorias.
     */
    distinct?: AsignacionAuditoriaScalarFieldEnum | AsignacionAuditoriaScalarFieldEnum[]
  }

  /**
   * AsignacionAuditoria findMany
   */
  export type AsignacionAuditoriaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionAuditorias to fetch.
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionAuditorias to fetch.
     */
    orderBy?: AsignacionAuditoriaOrderByWithRelationInput | AsignacionAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AsignacionAuditorias.
     */
    cursor?: AsignacionAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsignacionAuditorias.
     */
    distinct?: AsignacionAuditoriaScalarFieldEnum | AsignacionAuditoriaScalarFieldEnum[]
  }

  /**
   * AsignacionAuditoria create
   */
  export type AsignacionAuditoriaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * The data needed to create a AsignacionAuditoria.
     */
    data: XOR<AsignacionAuditoriaCreateInput, AsignacionAuditoriaUncheckedCreateInput>
  }

  /**
   * AsignacionAuditoria createMany
   */
  export type AsignacionAuditoriaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AsignacionAuditorias.
     */
    data: AsignacionAuditoriaCreateManyInput | AsignacionAuditoriaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AsignacionAuditoria update
   */
  export type AsignacionAuditoriaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * The data needed to update a AsignacionAuditoria.
     */
    data: XOR<AsignacionAuditoriaUpdateInput, AsignacionAuditoriaUncheckedUpdateInput>
    /**
     * Choose, which AsignacionAuditoria to update.
     */
    where: AsignacionAuditoriaWhereUniqueInput
  }

  /**
   * AsignacionAuditoria updateMany
   */
  export type AsignacionAuditoriaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AsignacionAuditorias.
     */
    data: XOR<AsignacionAuditoriaUpdateManyMutationInput, AsignacionAuditoriaUncheckedUpdateManyInput>
    /**
     * Filter which AsignacionAuditorias to update
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * Limit how many AsignacionAuditorias to update.
     */
    limit?: number
  }

  /**
   * AsignacionAuditoria upsert
   */
  export type AsignacionAuditoriaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * The filter to search for the AsignacionAuditoria to update in case it exists.
     */
    where: AsignacionAuditoriaWhereUniqueInput
    /**
     * In case the AsignacionAuditoria found by the `where` argument doesn't exist, create a new AsignacionAuditoria with this data.
     */
    create: XOR<AsignacionAuditoriaCreateInput, AsignacionAuditoriaUncheckedCreateInput>
    /**
     * In case the AsignacionAuditoria was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AsignacionAuditoriaUpdateInput, AsignacionAuditoriaUncheckedUpdateInput>
  }

  /**
   * AsignacionAuditoria delete
   */
  export type AsignacionAuditoriaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
    /**
     * Filter which AsignacionAuditoria to delete.
     */
    where: AsignacionAuditoriaWhereUniqueInput
  }

  /**
   * AsignacionAuditoria deleteMany
   */
  export type AsignacionAuditoriaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsignacionAuditorias to delete
     */
    where?: AsignacionAuditoriaWhereInput
    /**
     * Limit how many AsignacionAuditorias to delete.
     */
    limit?: number
  }

  /**
   * AsignacionAuditoria without action
   */
  export type AsignacionAuditoriaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionAuditoria
     */
    select?: AsignacionAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AsignacionAuditoria
     */
    omit?: AsignacionAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionAuditoriaInclude<ExtArgs> | null
  }


  /**
   * Model VisitaAuditoria
   */

  export type AggregateVisitaAuditoria = {
    _count: VisitaAuditoriaCountAggregateOutputType | null
    _avg: VisitaAuditoriaAvgAggregateOutputType | null
    _sum: VisitaAuditoriaSumAggregateOutputType | null
    _min: VisitaAuditoriaMinAggregateOutputType | null
    _max: VisitaAuditoriaMaxAggregateOutputType | null
  }

  export type VisitaAuditoriaAvgAggregateOutputType = {
    id_visita: number | null
    id_asignacion: number | null
    id_expediente: number | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    distancia_domicilio_m: Decimal | null
  }

  export type VisitaAuditoriaSumAggregateOutputType = {
    id_visita: number | null
    id_asignacion: number | null
    id_expediente: number | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    distancia_domicilio_m: Decimal | null
  }

  export type VisitaAuditoriaMinAggregateOutputType = {
    id_visita: number | null
    client_sync_id: string | null
    id_asignacion: number | null
    id_expediente: number | null
    id_usuario_auditor: string | null
    fecha_hora_checkin: Date | null
    fecha_hora_checkout: Date | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    distancia_domicilio_m: Decimal | null
    mock_location: boolean | null
    device_integrity_ok: boolean | null
    device_id: string | null
    server_received_at: Date | null
    resultado: string | null
    comentario_negocio: string | null
    comentario_auditor: string | null
    firma_evidencia: string | null
    estado: string | null
    fecha_creacion: Date | null
    fecha_actualizar: Date | null
  }

  export type VisitaAuditoriaMaxAggregateOutputType = {
    id_visita: number | null
    client_sync_id: string | null
    id_asignacion: number | null
    id_expediente: number | null
    id_usuario_auditor: string | null
    fecha_hora_checkin: Date | null
    fecha_hora_checkout: Date | null
    latitud: Decimal | null
    longitud: Decimal | null
    precision_metros: Decimal | null
    distancia_domicilio_m: Decimal | null
    mock_location: boolean | null
    device_integrity_ok: boolean | null
    device_id: string | null
    server_received_at: Date | null
    resultado: string | null
    comentario_negocio: string | null
    comentario_auditor: string | null
    firma_evidencia: string | null
    estado: string | null
    fecha_creacion: Date | null
    fecha_actualizar: Date | null
  }

  export type VisitaAuditoriaCountAggregateOutputType = {
    id_visita: number
    client_sync_id: number
    id_asignacion: number
    id_expediente: number
    id_usuario_auditor: number
    fecha_hora_checkin: number
    fecha_hora_checkout: number
    latitud: number
    longitud: number
    precision_metros: number
    distancia_domicilio_m: number
    mock_location: number
    device_integrity_ok: number
    device_id: number
    server_received_at: number
    resultado: number
    respuestas_cuestionario: number
    comentario_negocio: number
    comentario_auditor: number
    otros_clientes_domicilio: number
    otros_ingresos: number
    firma_evidencia: number
    estado: number
    fecha_creacion: number
    fecha_actualizar: number
    _all: number
  }


  export type VisitaAuditoriaAvgAggregateInputType = {
    id_visita?: true
    id_asignacion?: true
    id_expediente?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    distancia_domicilio_m?: true
  }

  export type VisitaAuditoriaSumAggregateInputType = {
    id_visita?: true
    id_asignacion?: true
    id_expediente?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    distancia_domicilio_m?: true
  }

  export type VisitaAuditoriaMinAggregateInputType = {
    id_visita?: true
    client_sync_id?: true
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_hora_checkin?: true
    fecha_hora_checkout?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    distancia_domicilio_m?: true
    mock_location?: true
    device_integrity_ok?: true
    device_id?: true
    server_received_at?: true
    resultado?: true
    comentario_negocio?: true
    comentario_auditor?: true
    firma_evidencia?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
  }

  export type VisitaAuditoriaMaxAggregateInputType = {
    id_visita?: true
    client_sync_id?: true
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_hora_checkin?: true
    fecha_hora_checkout?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    distancia_domicilio_m?: true
    mock_location?: true
    device_integrity_ok?: true
    device_id?: true
    server_received_at?: true
    resultado?: true
    comentario_negocio?: true
    comentario_auditor?: true
    firma_evidencia?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
  }

  export type VisitaAuditoriaCountAggregateInputType = {
    id_visita?: true
    client_sync_id?: true
    id_asignacion?: true
    id_expediente?: true
    id_usuario_auditor?: true
    fecha_hora_checkin?: true
    fecha_hora_checkout?: true
    latitud?: true
    longitud?: true
    precision_metros?: true
    distancia_domicilio_m?: true
    mock_location?: true
    device_integrity_ok?: true
    device_id?: true
    server_received_at?: true
    resultado?: true
    respuestas_cuestionario?: true
    comentario_negocio?: true
    comentario_auditor?: true
    otros_clientes_domicilio?: true
    otros_ingresos?: true
    firma_evidencia?: true
    estado?: true
    fecha_creacion?: true
    fecha_actualizar?: true
    _all?: true
  }

  export type VisitaAuditoriaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VisitaAuditoria to aggregate.
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VisitaAuditorias to fetch.
     */
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VisitaAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VisitaAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VisitaAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VisitaAuditorias
    **/
    _count?: true | VisitaAuditoriaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VisitaAuditoriaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VisitaAuditoriaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VisitaAuditoriaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VisitaAuditoriaMaxAggregateInputType
  }

  export type GetVisitaAuditoriaAggregateType<T extends VisitaAuditoriaAggregateArgs> = {
        [P in keyof T & keyof AggregateVisitaAuditoria]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVisitaAuditoria[P]>
      : GetScalarType<T[P], AggregateVisitaAuditoria[P]>
  }




  export type VisitaAuditoriaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VisitaAuditoriaWhereInput
    orderBy?: VisitaAuditoriaOrderByWithAggregationInput | VisitaAuditoriaOrderByWithAggregationInput[]
    by: VisitaAuditoriaScalarFieldEnum[] | VisitaAuditoriaScalarFieldEnum
    having?: VisitaAuditoriaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VisitaAuditoriaCountAggregateInputType | true
    _avg?: VisitaAuditoriaAvgAggregateInputType
    _sum?: VisitaAuditoriaSumAggregateInputType
    _min?: VisitaAuditoriaMinAggregateInputType
    _max?: VisitaAuditoriaMaxAggregateInputType
  }

  export type VisitaAuditoriaGroupByOutputType = {
    id_visita: number
    client_sync_id: string | null
    id_asignacion: number | null
    id_expediente: number
    id_usuario_auditor: string
    fecha_hora_checkin: Date
    fecha_hora_checkout: Date | null
    latitud: Decimal
    longitud: Decimal
    precision_metros: Decimal | null
    distancia_domicilio_m: Decimal | null
    mock_location: boolean
    device_integrity_ok: boolean
    device_id: string | null
    server_received_at: Date
    resultado: string
    respuestas_cuestionario: JsonValue
    comentario_negocio: string | null
    comentario_auditor: string | null
    otros_clientes_domicilio: JsonValue | null
    otros_ingresos: JsonValue | null
    firma_evidencia: string | null
    estado: string
    fecha_creacion: Date
    fecha_actualizar: Date
    _count: VisitaAuditoriaCountAggregateOutputType | null
    _avg: VisitaAuditoriaAvgAggregateOutputType | null
    _sum: VisitaAuditoriaSumAggregateOutputType | null
    _min: VisitaAuditoriaMinAggregateOutputType | null
    _max: VisitaAuditoriaMaxAggregateOutputType | null
  }

  type GetVisitaAuditoriaGroupByPayload<T extends VisitaAuditoriaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VisitaAuditoriaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VisitaAuditoriaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VisitaAuditoriaGroupByOutputType[P]>
            : GetScalarType<T[P], VisitaAuditoriaGroupByOutputType[P]>
        }
      >
    >


  export type VisitaAuditoriaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_visita?: boolean
    client_sync_id?: boolean
    id_asignacion?: boolean
    id_expediente?: boolean
    id_usuario_auditor?: boolean
    fecha_hora_checkin?: boolean
    fecha_hora_checkout?: boolean
    latitud?: boolean
    longitud?: boolean
    precision_metros?: boolean
    distancia_domicilio_m?: boolean
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: boolean
    server_received_at?: boolean
    resultado?: boolean
    respuestas_cuestionario?: boolean
    comentario_negocio?: boolean
    comentario_auditor?: boolean
    otros_clientes_domicilio?: boolean
    otros_ingresos?: boolean
    firma_evidencia?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    fecha_actualizar?: boolean
    expediente?: boolean | ExpedienteDefaultArgs<ExtArgs>
    auditor?: boolean | UsuarioDefaultArgs<ExtArgs>
    evidencias?: boolean | VisitaAuditoria$evidenciasArgs<ExtArgs>
    _count?: boolean | VisitaAuditoriaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["visitaAuditoria"]>



  export type VisitaAuditoriaSelectScalar = {
    id_visita?: boolean
    client_sync_id?: boolean
    id_asignacion?: boolean
    id_expediente?: boolean
    id_usuario_auditor?: boolean
    fecha_hora_checkin?: boolean
    fecha_hora_checkout?: boolean
    latitud?: boolean
    longitud?: boolean
    precision_metros?: boolean
    distancia_domicilio_m?: boolean
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: boolean
    server_received_at?: boolean
    resultado?: boolean
    respuestas_cuestionario?: boolean
    comentario_negocio?: boolean
    comentario_auditor?: boolean
    otros_clientes_domicilio?: boolean
    otros_ingresos?: boolean
    firma_evidencia?: boolean
    estado?: boolean
    fecha_creacion?: boolean
    fecha_actualizar?: boolean
  }

  export type VisitaAuditoriaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_visita" | "client_sync_id" | "id_asignacion" | "id_expediente" | "id_usuario_auditor" | "fecha_hora_checkin" | "fecha_hora_checkout" | "latitud" | "longitud" | "precision_metros" | "distancia_domicilio_m" | "mock_location" | "device_integrity_ok" | "device_id" | "server_received_at" | "resultado" | "respuestas_cuestionario" | "comentario_negocio" | "comentario_auditor" | "otros_clientes_domicilio" | "otros_ingresos" | "firma_evidencia" | "estado" | "fecha_creacion" | "fecha_actualizar", ExtArgs["result"]["visitaAuditoria"]>
  export type VisitaAuditoriaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    expediente?: boolean | ExpedienteDefaultArgs<ExtArgs>
    auditor?: boolean | UsuarioDefaultArgs<ExtArgs>
    evidencias?: boolean | VisitaAuditoria$evidenciasArgs<ExtArgs>
    _count?: boolean | VisitaAuditoriaCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $VisitaAuditoriaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VisitaAuditoria"
    objects: {
      expediente: Prisma.$ExpedientePayload<ExtArgs>
      auditor: Prisma.$UsuarioPayload<ExtArgs>
      evidencias: Prisma.$EvidenciaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_visita: number
      client_sync_id: string | null
      id_asignacion: number | null
      id_expediente: number
      id_usuario_auditor: string
      fecha_hora_checkin: Date
      fecha_hora_checkout: Date | null
      latitud: Prisma.Decimal
      longitud: Prisma.Decimal
      precision_metros: Prisma.Decimal | null
      distancia_domicilio_m: Prisma.Decimal | null
      mock_location: boolean
      device_integrity_ok: boolean
      device_id: string | null
      server_received_at: Date
      resultado: string
      respuestas_cuestionario: Prisma.JsonValue
      comentario_negocio: string | null
      comentario_auditor: string | null
      otros_clientes_domicilio: Prisma.JsonValue | null
      otros_ingresos: Prisma.JsonValue | null
      firma_evidencia: string | null
      estado: string
      fecha_creacion: Date
      fecha_actualizar: Date
    }, ExtArgs["result"]["visitaAuditoria"]>
    composites: {}
  }

  type VisitaAuditoriaGetPayload<S extends boolean | null | undefined | VisitaAuditoriaDefaultArgs> = $Result.GetResult<Prisma.$VisitaAuditoriaPayload, S>

  type VisitaAuditoriaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VisitaAuditoriaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VisitaAuditoriaCountAggregateInputType | true
    }

  export interface VisitaAuditoriaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VisitaAuditoria'], meta: { name: 'VisitaAuditoria' } }
    /**
     * Find zero or one VisitaAuditoria that matches the filter.
     * @param {VisitaAuditoriaFindUniqueArgs} args - Arguments to find a VisitaAuditoria
     * @example
     * // Get one VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VisitaAuditoriaFindUniqueArgs>(args: SelectSubset<T, VisitaAuditoriaFindUniqueArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VisitaAuditoria that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VisitaAuditoriaFindUniqueOrThrowArgs} args - Arguments to find a VisitaAuditoria
     * @example
     * // Get one VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VisitaAuditoriaFindUniqueOrThrowArgs>(args: SelectSubset<T, VisitaAuditoriaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VisitaAuditoria that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaFindFirstArgs} args - Arguments to find a VisitaAuditoria
     * @example
     * // Get one VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VisitaAuditoriaFindFirstArgs>(args?: SelectSubset<T, VisitaAuditoriaFindFirstArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VisitaAuditoria that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaFindFirstOrThrowArgs} args - Arguments to find a VisitaAuditoria
     * @example
     * // Get one VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VisitaAuditoriaFindFirstOrThrowArgs>(args?: SelectSubset<T, VisitaAuditoriaFindFirstOrThrowArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VisitaAuditorias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VisitaAuditorias
     * const visitaAuditorias = await prisma.visitaAuditoria.findMany()
     * 
     * // Get first 10 VisitaAuditorias
     * const visitaAuditorias = await prisma.visitaAuditoria.findMany({ take: 10 })
     * 
     * // Only select the `id_visita`
     * const visitaAuditoriaWithId_visitaOnly = await prisma.visitaAuditoria.findMany({ select: { id_visita: true } })
     * 
     */
    findMany<T extends VisitaAuditoriaFindManyArgs>(args?: SelectSubset<T, VisitaAuditoriaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VisitaAuditoria.
     * @param {VisitaAuditoriaCreateArgs} args - Arguments to create a VisitaAuditoria.
     * @example
     * // Create one VisitaAuditoria
     * const VisitaAuditoria = await prisma.visitaAuditoria.create({
     *   data: {
     *     // ... data to create a VisitaAuditoria
     *   }
     * })
     * 
     */
    create<T extends VisitaAuditoriaCreateArgs>(args: SelectSubset<T, VisitaAuditoriaCreateArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VisitaAuditorias.
     * @param {VisitaAuditoriaCreateManyArgs} args - Arguments to create many VisitaAuditorias.
     * @example
     * // Create many VisitaAuditorias
     * const visitaAuditoria = await prisma.visitaAuditoria.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VisitaAuditoriaCreateManyArgs>(args?: SelectSubset<T, VisitaAuditoriaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a VisitaAuditoria.
     * @param {VisitaAuditoriaDeleteArgs} args - Arguments to delete one VisitaAuditoria.
     * @example
     * // Delete one VisitaAuditoria
     * const VisitaAuditoria = await prisma.visitaAuditoria.delete({
     *   where: {
     *     // ... filter to delete one VisitaAuditoria
     *   }
     * })
     * 
     */
    delete<T extends VisitaAuditoriaDeleteArgs>(args: SelectSubset<T, VisitaAuditoriaDeleteArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VisitaAuditoria.
     * @param {VisitaAuditoriaUpdateArgs} args - Arguments to update one VisitaAuditoria.
     * @example
     * // Update one VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VisitaAuditoriaUpdateArgs>(args: SelectSubset<T, VisitaAuditoriaUpdateArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VisitaAuditorias.
     * @param {VisitaAuditoriaDeleteManyArgs} args - Arguments to filter VisitaAuditorias to delete.
     * @example
     * // Delete a few VisitaAuditorias
     * const { count } = await prisma.visitaAuditoria.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VisitaAuditoriaDeleteManyArgs>(args?: SelectSubset<T, VisitaAuditoriaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VisitaAuditorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VisitaAuditorias
     * const visitaAuditoria = await prisma.visitaAuditoria.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VisitaAuditoriaUpdateManyArgs>(args: SelectSubset<T, VisitaAuditoriaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one VisitaAuditoria.
     * @param {VisitaAuditoriaUpsertArgs} args - Arguments to update or create a VisitaAuditoria.
     * @example
     * // Update or create a VisitaAuditoria
     * const visitaAuditoria = await prisma.visitaAuditoria.upsert({
     *   create: {
     *     // ... data to create a VisitaAuditoria
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VisitaAuditoria we want to update
     *   }
     * })
     */
    upsert<T extends VisitaAuditoriaUpsertArgs>(args: SelectSubset<T, VisitaAuditoriaUpsertArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VisitaAuditorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaCountArgs} args - Arguments to filter VisitaAuditorias to count.
     * @example
     * // Count the number of VisitaAuditorias
     * const count = await prisma.visitaAuditoria.count({
     *   where: {
     *     // ... the filter for the VisitaAuditorias we want to count
     *   }
     * })
    **/
    count<T extends VisitaAuditoriaCountArgs>(
      args?: Subset<T, VisitaAuditoriaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VisitaAuditoriaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VisitaAuditoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VisitaAuditoriaAggregateArgs>(args: Subset<T, VisitaAuditoriaAggregateArgs>): Prisma.PrismaPromise<GetVisitaAuditoriaAggregateType<T>>

    /**
     * Group by VisitaAuditoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitaAuditoriaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VisitaAuditoriaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VisitaAuditoriaGroupByArgs['orderBy'] }
        : { orderBy?: VisitaAuditoriaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VisitaAuditoriaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVisitaAuditoriaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VisitaAuditoria model
   */
  readonly fields: VisitaAuditoriaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VisitaAuditoria.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VisitaAuditoriaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    expediente<T extends ExpedienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExpedienteDefaultArgs<ExtArgs>>): Prisma__ExpedienteClient<$Result.GetResult<Prisma.$ExpedientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    auditor<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    evidencias<T extends VisitaAuditoria$evidenciasArgs<ExtArgs> = {}>(args?: Subset<T, VisitaAuditoria$evidenciasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VisitaAuditoria model
   */
  interface VisitaAuditoriaFieldRefs {
    readonly id_visita: FieldRef<"VisitaAuditoria", 'Int'>
    readonly client_sync_id: FieldRef<"VisitaAuditoria", 'String'>
    readonly id_asignacion: FieldRef<"VisitaAuditoria", 'Int'>
    readonly id_expediente: FieldRef<"VisitaAuditoria", 'Int'>
    readonly id_usuario_auditor: FieldRef<"VisitaAuditoria", 'String'>
    readonly fecha_hora_checkin: FieldRef<"VisitaAuditoria", 'DateTime'>
    readonly fecha_hora_checkout: FieldRef<"VisitaAuditoria", 'DateTime'>
    readonly latitud: FieldRef<"VisitaAuditoria", 'Decimal'>
    readonly longitud: FieldRef<"VisitaAuditoria", 'Decimal'>
    readonly precision_metros: FieldRef<"VisitaAuditoria", 'Decimal'>
    readonly distancia_domicilio_m: FieldRef<"VisitaAuditoria", 'Decimal'>
    readonly mock_location: FieldRef<"VisitaAuditoria", 'Boolean'>
    readonly device_integrity_ok: FieldRef<"VisitaAuditoria", 'Boolean'>
    readonly device_id: FieldRef<"VisitaAuditoria", 'String'>
    readonly server_received_at: FieldRef<"VisitaAuditoria", 'DateTime'>
    readonly resultado: FieldRef<"VisitaAuditoria", 'String'>
    readonly respuestas_cuestionario: FieldRef<"VisitaAuditoria", 'Json'>
    readonly comentario_negocio: FieldRef<"VisitaAuditoria", 'String'>
    readonly comentario_auditor: FieldRef<"VisitaAuditoria", 'String'>
    readonly otros_clientes_domicilio: FieldRef<"VisitaAuditoria", 'Json'>
    readonly otros_ingresos: FieldRef<"VisitaAuditoria", 'Json'>
    readonly firma_evidencia: FieldRef<"VisitaAuditoria", 'String'>
    readonly estado: FieldRef<"VisitaAuditoria", 'String'>
    readonly fecha_creacion: FieldRef<"VisitaAuditoria", 'DateTime'>
    readonly fecha_actualizar: FieldRef<"VisitaAuditoria", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VisitaAuditoria findUnique
   */
  export type VisitaAuditoriaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which VisitaAuditoria to fetch.
     */
    where: VisitaAuditoriaWhereUniqueInput
  }

  /**
   * VisitaAuditoria findUniqueOrThrow
   */
  export type VisitaAuditoriaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which VisitaAuditoria to fetch.
     */
    where: VisitaAuditoriaWhereUniqueInput
  }

  /**
   * VisitaAuditoria findFirst
   */
  export type VisitaAuditoriaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which VisitaAuditoria to fetch.
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VisitaAuditorias to fetch.
     */
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VisitaAuditorias.
     */
    cursor?: VisitaAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VisitaAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VisitaAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VisitaAuditorias.
     */
    distinct?: VisitaAuditoriaScalarFieldEnum | VisitaAuditoriaScalarFieldEnum[]
  }

  /**
   * VisitaAuditoria findFirstOrThrow
   */
  export type VisitaAuditoriaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which VisitaAuditoria to fetch.
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VisitaAuditorias to fetch.
     */
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VisitaAuditorias.
     */
    cursor?: VisitaAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VisitaAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VisitaAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VisitaAuditorias.
     */
    distinct?: VisitaAuditoriaScalarFieldEnum | VisitaAuditoriaScalarFieldEnum[]
  }

  /**
   * VisitaAuditoria findMany
   */
  export type VisitaAuditoriaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter, which VisitaAuditorias to fetch.
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VisitaAuditorias to fetch.
     */
    orderBy?: VisitaAuditoriaOrderByWithRelationInput | VisitaAuditoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VisitaAuditorias.
     */
    cursor?: VisitaAuditoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VisitaAuditorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VisitaAuditorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VisitaAuditorias.
     */
    distinct?: VisitaAuditoriaScalarFieldEnum | VisitaAuditoriaScalarFieldEnum[]
  }

  /**
   * VisitaAuditoria create
   */
  export type VisitaAuditoriaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * The data needed to create a VisitaAuditoria.
     */
    data: XOR<VisitaAuditoriaCreateInput, VisitaAuditoriaUncheckedCreateInput>
  }

  /**
   * VisitaAuditoria createMany
   */
  export type VisitaAuditoriaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VisitaAuditorias.
     */
    data: VisitaAuditoriaCreateManyInput | VisitaAuditoriaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VisitaAuditoria update
   */
  export type VisitaAuditoriaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * The data needed to update a VisitaAuditoria.
     */
    data: XOR<VisitaAuditoriaUpdateInput, VisitaAuditoriaUncheckedUpdateInput>
    /**
     * Choose, which VisitaAuditoria to update.
     */
    where: VisitaAuditoriaWhereUniqueInput
  }

  /**
   * VisitaAuditoria updateMany
   */
  export type VisitaAuditoriaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VisitaAuditorias.
     */
    data: XOR<VisitaAuditoriaUpdateManyMutationInput, VisitaAuditoriaUncheckedUpdateManyInput>
    /**
     * Filter which VisitaAuditorias to update
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * Limit how many VisitaAuditorias to update.
     */
    limit?: number
  }

  /**
   * VisitaAuditoria upsert
   */
  export type VisitaAuditoriaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * The filter to search for the VisitaAuditoria to update in case it exists.
     */
    where: VisitaAuditoriaWhereUniqueInput
    /**
     * In case the VisitaAuditoria found by the `where` argument doesn't exist, create a new VisitaAuditoria with this data.
     */
    create: XOR<VisitaAuditoriaCreateInput, VisitaAuditoriaUncheckedCreateInput>
    /**
     * In case the VisitaAuditoria was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VisitaAuditoriaUpdateInput, VisitaAuditoriaUncheckedUpdateInput>
  }

  /**
   * VisitaAuditoria delete
   */
  export type VisitaAuditoriaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
    /**
     * Filter which VisitaAuditoria to delete.
     */
    where: VisitaAuditoriaWhereUniqueInput
  }

  /**
   * VisitaAuditoria deleteMany
   */
  export type VisitaAuditoriaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VisitaAuditorias to delete
     */
    where?: VisitaAuditoriaWhereInput
    /**
     * Limit how many VisitaAuditorias to delete.
     */
    limit?: number
  }

  /**
   * VisitaAuditoria.evidencias
   */
  export type VisitaAuditoria$evidenciasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    where?: EvidenciaWhereInput
    orderBy?: EvidenciaOrderByWithRelationInput | EvidenciaOrderByWithRelationInput[]
    cursor?: EvidenciaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EvidenciaScalarFieldEnum | EvidenciaScalarFieldEnum[]
  }

  /**
   * VisitaAuditoria without action
   */
  export type VisitaAuditoriaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitaAuditoria
     */
    select?: VisitaAuditoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VisitaAuditoria
     */
    omit?: VisitaAuditoriaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitaAuditoriaInclude<ExtArgs> | null
  }


  /**
   * Model Evidencia
   */

  export type AggregateEvidencia = {
    _count: EvidenciaCountAggregateOutputType | null
    _avg: EvidenciaAvgAggregateOutputType | null
    _sum: EvidenciaSumAggregateOutputType | null
    _min: EvidenciaMinAggregateOutputType | null
    _max: EvidenciaMaxAggregateOutputType | null
  }

  export type EvidenciaAvgAggregateOutputType = {
    id_visita: number | null
    latitud_captura: Decimal | null
    longitud_captura: Decimal | null
  }

  export type EvidenciaSumAggregateOutputType = {
    id_visita: number | null
    latitud_captura: Decimal | null
    longitud_captura: Decimal | null
  }

  export type EvidenciaMinAggregateOutputType = {
    id_evidencia: string | null
    id_visita: number | null
    tipo: string | null
    object_key: string | null
    hash_sha256: string | null
    latitud_captura: Decimal | null
    longitud_captura: Decimal | null
    capturado_en: Date | null
    fecha_creacion: Date | null
  }

  export type EvidenciaMaxAggregateOutputType = {
    id_evidencia: string | null
    id_visita: number | null
    tipo: string | null
    object_key: string | null
    hash_sha256: string | null
    latitud_captura: Decimal | null
    longitud_captura: Decimal | null
    capturado_en: Date | null
    fecha_creacion: Date | null
  }

  export type EvidenciaCountAggregateOutputType = {
    id_evidencia: number
    id_visita: number
    tipo: number
    object_key: number
    hash_sha256: number
    latitud_captura: number
    longitud_captura: number
    capturado_en: number
    fecha_creacion: number
    _all: number
  }


  export type EvidenciaAvgAggregateInputType = {
    id_visita?: true
    latitud_captura?: true
    longitud_captura?: true
  }

  export type EvidenciaSumAggregateInputType = {
    id_visita?: true
    latitud_captura?: true
    longitud_captura?: true
  }

  export type EvidenciaMinAggregateInputType = {
    id_evidencia?: true
    id_visita?: true
    tipo?: true
    object_key?: true
    hash_sha256?: true
    latitud_captura?: true
    longitud_captura?: true
    capturado_en?: true
    fecha_creacion?: true
  }

  export type EvidenciaMaxAggregateInputType = {
    id_evidencia?: true
    id_visita?: true
    tipo?: true
    object_key?: true
    hash_sha256?: true
    latitud_captura?: true
    longitud_captura?: true
    capturado_en?: true
    fecha_creacion?: true
  }

  export type EvidenciaCountAggregateInputType = {
    id_evidencia?: true
    id_visita?: true
    tipo?: true
    object_key?: true
    hash_sha256?: true
    latitud_captura?: true
    longitud_captura?: true
    capturado_en?: true
    fecha_creacion?: true
    _all?: true
  }

  export type EvidenciaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Evidencia to aggregate.
     */
    where?: EvidenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Evidencias to fetch.
     */
    orderBy?: EvidenciaOrderByWithRelationInput | EvidenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EvidenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Evidencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Evidencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Evidencias
    **/
    _count?: true | EvidenciaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EvidenciaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EvidenciaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EvidenciaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EvidenciaMaxAggregateInputType
  }

  export type GetEvidenciaAggregateType<T extends EvidenciaAggregateArgs> = {
        [P in keyof T & keyof AggregateEvidencia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvidencia[P]>
      : GetScalarType<T[P], AggregateEvidencia[P]>
  }




  export type EvidenciaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenciaWhereInput
    orderBy?: EvidenciaOrderByWithAggregationInput | EvidenciaOrderByWithAggregationInput[]
    by: EvidenciaScalarFieldEnum[] | EvidenciaScalarFieldEnum
    having?: EvidenciaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EvidenciaCountAggregateInputType | true
    _avg?: EvidenciaAvgAggregateInputType
    _sum?: EvidenciaSumAggregateInputType
    _min?: EvidenciaMinAggregateInputType
    _max?: EvidenciaMaxAggregateInputType
  }

  export type EvidenciaGroupByOutputType = {
    id_evidencia: string
    id_visita: number
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura: Decimal | null
    longitud_captura: Decimal | null
    capturado_en: Date
    fecha_creacion: Date
    _count: EvidenciaCountAggregateOutputType | null
    _avg: EvidenciaAvgAggregateOutputType | null
    _sum: EvidenciaSumAggregateOutputType | null
    _min: EvidenciaMinAggregateOutputType | null
    _max: EvidenciaMaxAggregateOutputType | null
  }

  type GetEvidenciaGroupByPayload<T extends EvidenciaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EvidenciaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EvidenciaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EvidenciaGroupByOutputType[P]>
            : GetScalarType<T[P], EvidenciaGroupByOutputType[P]>
        }
      >
    >


  export type EvidenciaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_evidencia?: boolean
    id_visita?: boolean
    tipo?: boolean
    object_key?: boolean
    hash_sha256?: boolean
    latitud_captura?: boolean
    longitud_captura?: boolean
    capturado_en?: boolean
    fecha_creacion?: boolean
    visita?: boolean | VisitaAuditoriaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidencia"]>



  export type EvidenciaSelectScalar = {
    id_evidencia?: boolean
    id_visita?: boolean
    tipo?: boolean
    object_key?: boolean
    hash_sha256?: boolean
    latitud_captura?: boolean
    longitud_captura?: boolean
    capturado_en?: boolean
    fecha_creacion?: boolean
  }

  export type EvidenciaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_evidencia" | "id_visita" | "tipo" | "object_key" | "hash_sha256" | "latitud_captura" | "longitud_captura" | "capturado_en" | "fecha_creacion", ExtArgs["result"]["evidencia"]>
  export type EvidenciaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    visita?: boolean | VisitaAuditoriaDefaultArgs<ExtArgs>
  }

  export type $EvidenciaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Evidencia"
    objects: {
      visita: Prisma.$VisitaAuditoriaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_evidencia: string
      id_visita: number
      tipo: string
      object_key: string
      hash_sha256: string
      latitud_captura: Prisma.Decimal | null
      longitud_captura: Prisma.Decimal | null
      capturado_en: Date
      fecha_creacion: Date
    }, ExtArgs["result"]["evidencia"]>
    composites: {}
  }

  type EvidenciaGetPayload<S extends boolean | null | undefined | EvidenciaDefaultArgs> = $Result.GetResult<Prisma.$EvidenciaPayload, S>

  type EvidenciaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EvidenciaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EvidenciaCountAggregateInputType | true
    }

  export interface EvidenciaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Evidencia'], meta: { name: 'Evidencia' } }
    /**
     * Find zero or one Evidencia that matches the filter.
     * @param {EvidenciaFindUniqueArgs} args - Arguments to find a Evidencia
     * @example
     * // Get one Evidencia
     * const evidencia = await prisma.evidencia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EvidenciaFindUniqueArgs>(args: SelectSubset<T, EvidenciaFindUniqueArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Evidencia that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EvidenciaFindUniqueOrThrowArgs} args - Arguments to find a Evidencia
     * @example
     * // Get one Evidencia
     * const evidencia = await prisma.evidencia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EvidenciaFindUniqueOrThrowArgs>(args: SelectSubset<T, EvidenciaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evidencia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaFindFirstArgs} args - Arguments to find a Evidencia
     * @example
     * // Get one Evidencia
     * const evidencia = await prisma.evidencia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EvidenciaFindFirstArgs>(args?: SelectSubset<T, EvidenciaFindFirstArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evidencia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaFindFirstOrThrowArgs} args - Arguments to find a Evidencia
     * @example
     * // Get one Evidencia
     * const evidencia = await prisma.evidencia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EvidenciaFindFirstOrThrowArgs>(args?: SelectSubset<T, EvidenciaFindFirstOrThrowArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Evidencias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Evidencias
     * const evidencias = await prisma.evidencia.findMany()
     * 
     * // Get first 10 Evidencias
     * const evidencias = await prisma.evidencia.findMany({ take: 10 })
     * 
     * // Only select the `id_evidencia`
     * const evidenciaWithId_evidenciaOnly = await prisma.evidencia.findMany({ select: { id_evidencia: true } })
     * 
     */
    findMany<T extends EvidenciaFindManyArgs>(args?: SelectSubset<T, EvidenciaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Evidencia.
     * @param {EvidenciaCreateArgs} args - Arguments to create a Evidencia.
     * @example
     * // Create one Evidencia
     * const Evidencia = await prisma.evidencia.create({
     *   data: {
     *     // ... data to create a Evidencia
     *   }
     * })
     * 
     */
    create<T extends EvidenciaCreateArgs>(args: SelectSubset<T, EvidenciaCreateArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Evidencias.
     * @param {EvidenciaCreateManyArgs} args - Arguments to create many Evidencias.
     * @example
     * // Create many Evidencias
     * const evidencia = await prisma.evidencia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EvidenciaCreateManyArgs>(args?: SelectSubset<T, EvidenciaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Evidencia.
     * @param {EvidenciaDeleteArgs} args - Arguments to delete one Evidencia.
     * @example
     * // Delete one Evidencia
     * const Evidencia = await prisma.evidencia.delete({
     *   where: {
     *     // ... filter to delete one Evidencia
     *   }
     * })
     * 
     */
    delete<T extends EvidenciaDeleteArgs>(args: SelectSubset<T, EvidenciaDeleteArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Evidencia.
     * @param {EvidenciaUpdateArgs} args - Arguments to update one Evidencia.
     * @example
     * // Update one Evidencia
     * const evidencia = await prisma.evidencia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EvidenciaUpdateArgs>(args: SelectSubset<T, EvidenciaUpdateArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Evidencias.
     * @param {EvidenciaDeleteManyArgs} args - Arguments to filter Evidencias to delete.
     * @example
     * // Delete a few Evidencias
     * const { count } = await prisma.evidencia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EvidenciaDeleteManyArgs>(args?: SelectSubset<T, EvidenciaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Evidencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Evidencias
     * const evidencia = await prisma.evidencia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EvidenciaUpdateManyArgs>(args: SelectSubset<T, EvidenciaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Evidencia.
     * @param {EvidenciaUpsertArgs} args - Arguments to update or create a Evidencia.
     * @example
     * // Update or create a Evidencia
     * const evidencia = await prisma.evidencia.upsert({
     *   create: {
     *     // ... data to create a Evidencia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Evidencia we want to update
     *   }
     * })
     */
    upsert<T extends EvidenciaUpsertArgs>(args: SelectSubset<T, EvidenciaUpsertArgs<ExtArgs>>): Prisma__EvidenciaClient<$Result.GetResult<Prisma.$EvidenciaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Evidencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaCountArgs} args - Arguments to filter Evidencias to count.
     * @example
     * // Count the number of Evidencias
     * const count = await prisma.evidencia.count({
     *   where: {
     *     // ... the filter for the Evidencias we want to count
     *   }
     * })
    **/
    count<T extends EvidenciaCountArgs>(
      args?: Subset<T, EvidenciaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EvidenciaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Evidencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EvidenciaAggregateArgs>(args: Subset<T, EvidenciaAggregateArgs>): Prisma.PrismaPromise<GetEvidenciaAggregateType<T>>

    /**
     * Group by Evidencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenciaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EvidenciaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EvidenciaGroupByArgs['orderBy'] }
        : { orderBy?: EvidenciaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EvidenciaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenciaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Evidencia model
   */
  readonly fields: EvidenciaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Evidencia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EvidenciaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    visita<T extends VisitaAuditoriaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VisitaAuditoriaDefaultArgs<ExtArgs>>): Prisma__VisitaAuditoriaClient<$Result.GetResult<Prisma.$VisitaAuditoriaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Evidencia model
   */
  interface EvidenciaFieldRefs {
    readonly id_evidencia: FieldRef<"Evidencia", 'String'>
    readonly id_visita: FieldRef<"Evidencia", 'Int'>
    readonly tipo: FieldRef<"Evidencia", 'String'>
    readonly object_key: FieldRef<"Evidencia", 'String'>
    readonly hash_sha256: FieldRef<"Evidencia", 'String'>
    readonly latitud_captura: FieldRef<"Evidencia", 'Decimal'>
    readonly longitud_captura: FieldRef<"Evidencia", 'Decimal'>
    readonly capturado_en: FieldRef<"Evidencia", 'DateTime'>
    readonly fecha_creacion: FieldRef<"Evidencia", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Evidencia findUnique
   */
  export type EvidenciaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter, which Evidencia to fetch.
     */
    where: EvidenciaWhereUniqueInput
  }

  /**
   * Evidencia findUniqueOrThrow
   */
  export type EvidenciaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter, which Evidencia to fetch.
     */
    where: EvidenciaWhereUniqueInput
  }

  /**
   * Evidencia findFirst
   */
  export type EvidenciaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter, which Evidencia to fetch.
     */
    where?: EvidenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Evidencias to fetch.
     */
    orderBy?: EvidenciaOrderByWithRelationInput | EvidenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Evidencias.
     */
    cursor?: EvidenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Evidencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Evidencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Evidencias.
     */
    distinct?: EvidenciaScalarFieldEnum | EvidenciaScalarFieldEnum[]
  }

  /**
   * Evidencia findFirstOrThrow
   */
  export type EvidenciaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter, which Evidencia to fetch.
     */
    where?: EvidenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Evidencias to fetch.
     */
    orderBy?: EvidenciaOrderByWithRelationInput | EvidenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Evidencias.
     */
    cursor?: EvidenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Evidencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Evidencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Evidencias.
     */
    distinct?: EvidenciaScalarFieldEnum | EvidenciaScalarFieldEnum[]
  }

  /**
   * Evidencia findMany
   */
  export type EvidenciaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter, which Evidencias to fetch.
     */
    where?: EvidenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Evidencias to fetch.
     */
    orderBy?: EvidenciaOrderByWithRelationInput | EvidenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Evidencias.
     */
    cursor?: EvidenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Evidencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Evidencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Evidencias.
     */
    distinct?: EvidenciaScalarFieldEnum | EvidenciaScalarFieldEnum[]
  }

  /**
   * Evidencia create
   */
  export type EvidenciaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * The data needed to create a Evidencia.
     */
    data: XOR<EvidenciaCreateInput, EvidenciaUncheckedCreateInput>
  }

  /**
   * Evidencia createMany
   */
  export type EvidenciaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Evidencias.
     */
    data: EvidenciaCreateManyInput | EvidenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Evidencia update
   */
  export type EvidenciaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * The data needed to update a Evidencia.
     */
    data: XOR<EvidenciaUpdateInput, EvidenciaUncheckedUpdateInput>
    /**
     * Choose, which Evidencia to update.
     */
    where: EvidenciaWhereUniqueInput
  }

  /**
   * Evidencia updateMany
   */
  export type EvidenciaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Evidencias.
     */
    data: XOR<EvidenciaUpdateManyMutationInput, EvidenciaUncheckedUpdateManyInput>
    /**
     * Filter which Evidencias to update
     */
    where?: EvidenciaWhereInput
    /**
     * Limit how many Evidencias to update.
     */
    limit?: number
  }

  /**
   * Evidencia upsert
   */
  export type EvidenciaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * The filter to search for the Evidencia to update in case it exists.
     */
    where: EvidenciaWhereUniqueInput
    /**
     * In case the Evidencia found by the `where` argument doesn't exist, create a new Evidencia with this data.
     */
    create: XOR<EvidenciaCreateInput, EvidenciaUncheckedCreateInput>
    /**
     * In case the Evidencia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EvidenciaUpdateInput, EvidenciaUncheckedUpdateInput>
  }

  /**
   * Evidencia delete
   */
  export type EvidenciaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
    /**
     * Filter which Evidencia to delete.
     */
    where: EvidenciaWhereUniqueInput
  }

  /**
   * Evidencia deleteMany
   */
  export type EvidenciaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Evidencias to delete
     */
    where?: EvidenciaWhereInput
    /**
     * Limit how many Evidencias to delete.
     */
    limit?: number
  }

  /**
   * Evidencia without action
   */
  export type EvidenciaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Evidencia
     */
    select?: EvidenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Evidencia
     */
    omit?: EvidenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenciaInclude<ExtArgs> | null
  }


  /**
   * Model AuditoriaSeguridad
   */

  export type AggregateAuditoriaSeguridad = {
    _count: AuditoriaSeguridadCountAggregateOutputType | null
    _avg: AuditoriaSeguridadAvgAggregateOutputType | null
    _sum: AuditoriaSeguridadSumAggregateOutputType | null
    _min: AuditoriaSeguridadMinAggregateOutputType | null
    _max: AuditoriaSeguridadMaxAggregateOutputType | null
  }

  export type AuditoriaSeguridadAvgAggregateOutputType = {
    estado_http: number | null
  }

  export type AuditoriaSeguridadSumAggregateOutputType = {
    estado_http: number | null
  }

  export type AuditoriaSeguridadMinAggregateOutputType = {
    id_auditoria: string | null
    fecha: Date | null
    request_id: string | null
    actor_id: string | null
    actor: string | null
    rol: string | null
    metodo: string | null
    ruta: string | null
    estado_http: number | null
    ip_address: string | null
    ip_hash: string | null
    user_agent: string | null
    device_id: string | null
    mock_location: boolean | null
  }

  export type AuditoriaSeguridadMaxAggregateOutputType = {
    id_auditoria: string | null
    fecha: Date | null
    request_id: string | null
    actor_id: string | null
    actor: string | null
    rol: string | null
    metodo: string | null
    ruta: string | null
    estado_http: number | null
    ip_address: string | null
    ip_hash: string | null
    user_agent: string | null
    device_id: string | null
    mock_location: boolean | null
  }

  export type AuditoriaSeguridadCountAggregateOutputType = {
    id_auditoria: number
    fecha: number
    request_id: number
    actor_id: number
    actor: number
    rol: number
    metodo: number
    ruta: number
    estado_http: number
    ip_address: number
    ip_hash: number
    user_agent: number
    device_id: number
    mock_location: number
    _all: number
  }


  export type AuditoriaSeguridadAvgAggregateInputType = {
    estado_http?: true
  }

  export type AuditoriaSeguridadSumAggregateInputType = {
    estado_http?: true
  }

  export type AuditoriaSeguridadMinAggregateInputType = {
    id_auditoria?: true
    fecha?: true
    request_id?: true
    actor_id?: true
    actor?: true
    rol?: true
    metodo?: true
    ruta?: true
    estado_http?: true
    ip_address?: true
    ip_hash?: true
    user_agent?: true
    device_id?: true
    mock_location?: true
  }

  export type AuditoriaSeguridadMaxAggregateInputType = {
    id_auditoria?: true
    fecha?: true
    request_id?: true
    actor_id?: true
    actor?: true
    rol?: true
    metodo?: true
    ruta?: true
    estado_http?: true
    ip_address?: true
    ip_hash?: true
    user_agent?: true
    device_id?: true
    mock_location?: true
  }

  export type AuditoriaSeguridadCountAggregateInputType = {
    id_auditoria?: true
    fecha?: true
    request_id?: true
    actor_id?: true
    actor?: true
    rol?: true
    metodo?: true
    ruta?: true
    estado_http?: true
    ip_address?: true
    ip_hash?: true
    user_agent?: true
    device_id?: true
    mock_location?: true
    _all?: true
  }

  export type AuditoriaSeguridadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditoriaSeguridad to aggregate.
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaSeguridads to fetch.
     */
    orderBy?: AuditoriaSeguridadOrderByWithRelationInput | AuditoriaSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditoriaSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditoriaSeguridads
    **/
    _count?: true | AuditoriaSeguridadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuditoriaSeguridadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuditoriaSeguridadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditoriaSeguridadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditoriaSeguridadMaxAggregateInputType
  }

  export type GetAuditoriaSeguridadAggregateType<T extends AuditoriaSeguridadAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditoriaSeguridad]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditoriaSeguridad[P]>
      : GetScalarType<T[P], AggregateAuditoriaSeguridad[P]>
  }




  export type AuditoriaSeguridadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditoriaSeguridadWhereInput
    orderBy?: AuditoriaSeguridadOrderByWithAggregationInput | AuditoriaSeguridadOrderByWithAggregationInput[]
    by: AuditoriaSeguridadScalarFieldEnum[] | AuditoriaSeguridadScalarFieldEnum
    having?: AuditoriaSeguridadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditoriaSeguridadCountAggregateInputType | true
    _avg?: AuditoriaSeguridadAvgAggregateInputType
    _sum?: AuditoriaSeguridadSumAggregateInputType
    _min?: AuditoriaSeguridadMinAggregateInputType
    _max?: AuditoriaSeguridadMaxAggregateInputType
  }

  export type AuditoriaSeguridadGroupByOutputType = {
    id_auditoria: string
    fecha: Date
    request_id: string | null
    actor_id: string | null
    actor: string | null
    rol: string | null
    metodo: string
    ruta: string
    estado_http: number
    ip_address: string | null
    ip_hash: string | null
    user_agent: string | null
    device_id: string | null
    mock_location: boolean | null
    _count: AuditoriaSeguridadCountAggregateOutputType | null
    _avg: AuditoriaSeguridadAvgAggregateOutputType | null
    _sum: AuditoriaSeguridadSumAggregateOutputType | null
    _min: AuditoriaSeguridadMinAggregateOutputType | null
    _max: AuditoriaSeguridadMaxAggregateOutputType | null
  }

  type GetAuditoriaSeguridadGroupByPayload<T extends AuditoriaSeguridadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditoriaSeguridadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditoriaSeguridadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditoriaSeguridadGroupByOutputType[P]>
            : GetScalarType<T[P], AuditoriaSeguridadGroupByOutputType[P]>
        }
      >
    >


  export type AuditoriaSeguridadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_auditoria?: boolean
    fecha?: boolean
    request_id?: boolean
    actor_id?: boolean
    actor?: boolean
    rol?: boolean
    metodo?: boolean
    ruta?: boolean
    estado_http?: boolean
    ip_address?: boolean
    ip_hash?: boolean
    user_agent?: boolean
    device_id?: boolean
    mock_location?: boolean
  }, ExtArgs["result"]["auditoriaSeguridad"]>



  export type AuditoriaSeguridadSelectScalar = {
    id_auditoria?: boolean
    fecha?: boolean
    request_id?: boolean
    actor_id?: boolean
    actor?: boolean
    rol?: boolean
    metodo?: boolean
    ruta?: boolean
    estado_http?: boolean
    ip_address?: boolean
    ip_hash?: boolean
    user_agent?: boolean
    device_id?: boolean
    mock_location?: boolean
  }

  export type AuditoriaSeguridadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_auditoria" | "fecha" | "request_id" | "actor_id" | "actor" | "rol" | "metodo" | "ruta" | "estado_http" | "ip_address" | "ip_hash" | "user_agent" | "device_id" | "mock_location", ExtArgs["result"]["auditoriaSeguridad"]>

  export type $AuditoriaSeguridadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditoriaSeguridad"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_auditoria: string
      fecha: Date
      request_id: string | null
      actor_id: string | null
      actor: string | null
      rol: string | null
      metodo: string
      ruta: string
      estado_http: number
      ip_address: string | null
      ip_hash: string | null
      user_agent: string | null
      device_id: string | null
      mock_location: boolean | null
    }, ExtArgs["result"]["auditoriaSeguridad"]>
    composites: {}
  }

  type AuditoriaSeguridadGetPayload<S extends boolean | null | undefined | AuditoriaSeguridadDefaultArgs> = $Result.GetResult<Prisma.$AuditoriaSeguridadPayload, S>

  type AuditoriaSeguridadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditoriaSeguridadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditoriaSeguridadCountAggregateInputType | true
    }

  export interface AuditoriaSeguridadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditoriaSeguridad'], meta: { name: 'AuditoriaSeguridad' } }
    /**
     * Find zero or one AuditoriaSeguridad that matches the filter.
     * @param {AuditoriaSeguridadFindUniqueArgs} args - Arguments to find a AuditoriaSeguridad
     * @example
     * // Get one AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditoriaSeguridadFindUniqueArgs>(args: SelectSubset<T, AuditoriaSeguridadFindUniqueArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditoriaSeguridad that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditoriaSeguridadFindUniqueOrThrowArgs} args - Arguments to find a AuditoriaSeguridad
     * @example
     * // Get one AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditoriaSeguridadFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditoriaSeguridadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditoriaSeguridad that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadFindFirstArgs} args - Arguments to find a AuditoriaSeguridad
     * @example
     * // Get one AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditoriaSeguridadFindFirstArgs>(args?: SelectSubset<T, AuditoriaSeguridadFindFirstArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditoriaSeguridad that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadFindFirstOrThrowArgs} args - Arguments to find a AuditoriaSeguridad
     * @example
     * // Get one AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditoriaSeguridadFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditoriaSeguridadFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditoriaSeguridads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditoriaSeguridads
     * const auditoriaSeguridads = await prisma.auditoriaSeguridad.findMany()
     * 
     * // Get first 10 AuditoriaSeguridads
     * const auditoriaSeguridads = await prisma.auditoriaSeguridad.findMany({ take: 10 })
     * 
     * // Only select the `id_auditoria`
     * const auditoriaSeguridadWithId_auditoriaOnly = await prisma.auditoriaSeguridad.findMany({ select: { id_auditoria: true } })
     * 
     */
    findMany<T extends AuditoriaSeguridadFindManyArgs>(args?: SelectSubset<T, AuditoriaSeguridadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditoriaSeguridad.
     * @param {AuditoriaSeguridadCreateArgs} args - Arguments to create a AuditoriaSeguridad.
     * @example
     * // Create one AuditoriaSeguridad
     * const AuditoriaSeguridad = await prisma.auditoriaSeguridad.create({
     *   data: {
     *     // ... data to create a AuditoriaSeguridad
     *   }
     * })
     * 
     */
    create<T extends AuditoriaSeguridadCreateArgs>(args: SelectSubset<T, AuditoriaSeguridadCreateArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditoriaSeguridads.
     * @param {AuditoriaSeguridadCreateManyArgs} args - Arguments to create many AuditoriaSeguridads.
     * @example
     * // Create many AuditoriaSeguridads
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditoriaSeguridadCreateManyArgs>(args?: SelectSubset<T, AuditoriaSeguridadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuditoriaSeguridad.
     * @param {AuditoriaSeguridadDeleteArgs} args - Arguments to delete one AuditoriaSeguridad.
     * @example
     * // Delete one AuditoriaSeguridad
     * const AuditoriaSeguridad = await prisma.auditoriaSeguridad.delete({
     *   where: {
     *     // ... filter to delete one AuditoriaSeguridad
     *   }
     * })
     * 
     */
    delete<T extends AuditoriaSeguridadDeleteArgs>(args: SelectSubset<T, AuditoriaSeguridadDeleteArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditoriaSeguridad.
     * @param {AuditoriaSeguridadUpdateArgs} args - Arguments to update one AuditoriaSeguridad.
     * @example
     * // Update one AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditoriaSeguridadUpdateArgs>(args: SelectSubset<T, AuditoriaSeguridadUpdateArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditoriaSeguridads.
     * @param {AuditoriaSeguridadDeleteManyArgs} args - Arguments to filter AuditoriaSeguridads to delete.
     * @example
     * // Delete a few AuditoriaSeguridads
     * const { count } = await prisma.auditoriaSeguridad.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditoriaSeguridadDeleteManyArgs>(args?: SelectSubset<T, AuditoriaSeguridadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditoriaSeguridads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditoriaSeguridads
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditoriaSeguridadUpdateManyArgs>(args: SelectSubset<T, AuditoriaSeguridadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditoriaSeguridad.
     * @param {AuditoriaSeguridadUpsertArgs} args - Arguments to update or create a AuditoriaSeguridad.
     * @example
     * // Update or create a AuditoriaSeguridad
     * const auditoriaSeguridad = await prisma.auditoriaSeguridad.upsert({
     *   create: {
     *     // ... data to create a AuditoriaSeguridad
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditoriaSeguridad we want to update
     *   }
     * })
     */
    upsert<T extends AuditoriaSeguridadUpsertArgs>(args: SelectSubset<T, AuditoriaSeguridadUpsertArgs<ExtArgs>>): Prisma__AuditoriaSeguridadClient<$Result.GetResult<Prisma.$AuditoriaSeguridadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditoriaSeguridads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadCountArgs} args - Arguments to filter AuditoriaSeguridads to count.
     * @example
     * // Count the number of AuditoriaSeguridads
     * const count = await prisma.auditoriaSeguridad.count({
     *   where: {
     *     // ... the filter for the AuditoriaSeguridads we want to count
     *   }
     * })
    **/
    count<T extends AuditoriaSeguridadCountArgs>(
      args?: Subset<T, AuditoriaSeguridadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditoriaSeguridadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditoriaSeguridad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditoriaSeguridadAggregateArgs>(args: Subset<T, AuditoriaSeguridadAggregateArgs>): Prisma.PrismaPromise<GetAuditoriaSeguridadAggregateType<T>>

    /**
     * Group by AuditoriaSeguridad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaSeguridadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditoriaSeguridadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditoriaSeguridadGroupByArgs['orderBy'] }
        : { orderBy?: AuditoriaSeguridadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditoriaSeguridadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditoriaSeguridadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditoriaSeguridad model
   */
  readonly fields: AuditoriaSeguridadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditoriaSeguridad.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditoriaSeguridadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditoriaSeguridad model
   */
  interface AuditoriaSeguridadFieldRefs {
    readonly id_auditoria: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly fecha: FieldRef<"AuditoriaSeguridad", 'DateTime'>
    readonly request_id: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly actor_id: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly actor: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly rol: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly metodo: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly ruta: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly estado_http: FieldRef<"AuditoriaSeguridad", 'Int'>
    readonly ip_address: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly ip_hash: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly user_agent: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly device_id: FieldRef<"AuditoriaSeguridad", 'String'>
    readonly mock_location: FieldRef<"AuditoriaSeguridad", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * AuditoriaSeguridad findUnique
   */
  export type AuditoriaSeguridadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter, which AuditoriaSeguridad to fetch.
     */
    where: AuditoriaSeguridadWhereUniqueInput
  }

  /**
   * AuditoriaSeguridad findUniqueOrThrow
   */
  export type AuditoriaSeguridadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter, which AuditoriaSeguridad to fetch.
     */
    where: AuditoriaSeguridadWhereUniqueInput
  }

  /**
   * AuditoriaSeguridad findFirst
   */
  export type AuditoriaSeguridadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter, which AuditoriaSeguridad to fetch.
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaSeguridads to fetch.
     */
    orderBy?: AuditoriaSeguridadOrderByWithRelationInput | AuditoriaSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditoriaSeguridads.
     */
    cursor?: AuditoriaSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditoriaSeguridads.
     */
    distinct?: AuditoriaSeguridadScalarFieldEnum | AuditoriaSeguridadScalarFieldEnum[]
  }

  /**
   * AuditoriaSeguridad findFirstOrThrow
   */
  export type AuditoriaSeguridadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter, which AuditoriaSeguridad to fetch.
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaSeguridads to fetch.
     */
    orderBy?: AuditoriaSeguridadOrderByWithRelationInput | AuditoriaSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditoriaSeguridads.
     */
    cursor?: AuditoriaSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditoriaSeguridads.
     */
    distinct?: AuditoriaSeguridadScalarFieldEnum | AuditoriaSeguridadScalarFieldEnum[]
  }

  /**
   * AuditoriaSeguridad findMany
   */
  export type AuditoriaSeguridadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter, which AuditoriaSeguridads to fetch.
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaSeguridads to fetch.
     */
    orderBy?: AuditoriaSeguridadOrderByWithRelationInput | AuditoriaSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditoriaSeguridads.
     */
    cursor?: AuditoriaSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditoriaSeguridads.
     */
    distinct?: AuditoriaSeguridadScalarFieldEnum | AuditoriaSeguridadScalarFieldEnum[]
  }

  /**
   * AuditoriaSeguridad create
   */
  export type AuditoriaSeguridadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditoriaSeguridad.
     */
    data: XOR<AuditoriaSeguridadCreateInput, AuditoriaSeguridadUncheckedCreateInput>
  }

  /**
   * AuditoriaSeguridad createMany
   */
  export type AuditoriaSeguridadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditoriaSeguridads.
     */
    data: AuditoriaSeguridadCreateManyInput | AuditoriaSeguridadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditoriaSeguridad update
   */
  export type AuditoriaSeguridadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditoriaSeguridad.
     */
    data: XOR<AuditoriaSeguridadUpdateInput, AuditoriaSeguridadUncheckedUpdateInput>
    /**
     * Choose, which AuditoriaSeguridad to update.
     */
    where: AuditoriaSeguridadWhereUniqueInput
  }

  /**
   * AuditoriaSeguridad updateMany
   */
  export type AuditoriaSeguridadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditoriaSeguridads.
     */
    data: XOR<AuditoriaSeguridadUpdateManyMutationInput, AuditoriaSeguridadUncheckedUpdateManyInput>
    /**
     * Filter which AuditoriaSeguridads to update
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * Limit how many AuditoriaSeguridads to update.
     */
    limit?: number
  }

  /**
   * AuditoriaSeguridad upsert
   */
  export type AuditoriaSeguridadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditoriaSeguridad to update in case it exists.
     */
    where: AuditoriaSeguridadWhereUniqueInput
    /**
     * In case the AuditoriaSeguridad found by the `where` argument doesn't exist, create a new AuditoriaSeguridad with this data.
     */
    create: XOR<AuditoriaSeguridadCreateInput, AuditoriaSeguridadUncheckedCreateInput>
    /**
     * In case the AuditoriaSeguridad was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditoriaSeguridadUpdateInput, AuditoriaSeguridadUncheckedUpdateInput>
  }

  /**
   * AuditoriaSeguridad delete
   */
  export type AuditoriaSeguridadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
    /**
     * Filter which AuditoriaSeguridad to delete.
     */
    where: AuditoriaSeguridadWhereUniqueInput
  }

  /**
   * AuditoriaSeguridad deleteMany
   */
  export type AuditoriaSeguridadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditoriaSeguridads to delete
     */
    where?: AuditoriaSeguridadWhereInput
    /**
     * Limit how many AuditoriaSeguridads to delete.
     */
    limit?: number
  }

  /**
   * AuditoriaSeguridad without action
   */
  export type AuditoriaSeguridadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaSeguridad
     */
    select?: AuditoriaSeguridadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaSeguridad
     */
    omit?: AuditoriaSeguridadOmit<ExtArgs> | null
  }


  /**
   * Model ImportacionMasiva
   */

  export type AggregateImportacionMasiva = {
    _count: ImportacionMasivaCountAggregateOutputType | null
    _avg: ImportacionMasivaAvgAggregateOutputType | null
    _sum: ImportacionMasivaSumAggregateOutputType | null
    _min: ImportacionMasivaMinAggregateOutputType | null
    _max: ImportacionMasivaMaxAggregateOutputType | null
  }

  export type ImportacionMasivaAvgAggregateOutputType = {
    total_filas: number | null
    procesadas: number | null
    insertadas: number | null
    actualizadas: number | null
    omitidas: number | null
    errores: number | null
  }

  export type ImportacionMasivaSumAggregateOutputType = {
    total_filas: number | null
    procesadas: number | null
    insertadas: number | null
    actualizadas: number | null
    omitidas: number | null
    errores: number | null
  }

  export type ImportacionMasivaMinAggregateOutputType = {
    id_importacion: string | null
    tipo: string | null
    estado: string | null
    archivo: string | null
    ruta_temporal: string | null
    actor_id: string | null
    total_filas: number | null
    procesadas: number | null
    insertadas: number | null
    actualizadas: number | null
    omitidas: number | null
    errores: number | null
    fecha_creacion: Date | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
  }

  export type ImportacionMasivaMaxAggregateOutputType = {
    id_importacion: string | null
    tipo: string | null
    estado: string | null
    archivo: string | null
    ruta_temporal: string | null
    actor_id: string | null
    total_filas: number | null
    procesadas: number | null
    insertadas: number | null
    actualizadas: number | null
    omitidas: number | null
    errores: number | null
    fecha_creacion: Date | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
  }

  export type ImportacionMasivaCountAggregateOutputType = {
    id_importacion: number
    tipo: number
    estado: number
    archivo: number
    ruta_temporal: number
    actor_id: number
    total_filas: number
    procesadas: number
    insertadas: number
    actualizadas: number
    omitidas: number
    errores: number
    detalle_error: number
    fecha_creacion: number
    fecha_inicio: number
    fecha_fin: number
    _all: number
  }


  export type ImportacionMasivaAvgAggregateInputType = {
    total_filas?: true
    procesadas?: true
    insertadas?: true
    actualizadas?: true
    omitidas?: true
    errores?: true
  }

  export type ImportacionMasivaSumAggregateInputType = {
    total_filas?: true
    procesadas?: true
    insertadas?: true
    actualizadas?: true
    omitidas?: true
    errores?: true
  }

  export type ImportacionMasivaMinAggregateInputType = {
    id_importacion?: true
    tipo?: true
    estado?: true
    archivo?: true
    ruta_temporal?: true
    actor_id?: true
    total_filas?: true
    procesadas?: true
    insertadas?: true
    actualizadas?: true
    omitidas?: true
    errores?: true
    fecha_creacion?: true
    fecha_inicio?: true
    fecha_fin?: true
  }

  export type ImportacionMasivaMaxAggregateInputType = {
    id_importacion?: true
    tipo?: true
    estado?: true
    archivo?: true
    ruta_temporal?: true
    actor_id?: true
    total_filas?: true
    procesadas?: true
    insertadas?: true
    actualizadas?: true
    omitidas?: true
    errores?: true
    fecha_creacion?: true
    fecha_inicio?: true
    fecha_fin?: true
  }

  export type ImportacionMasivaCountAggregateInputType = {
    id_importacion?: true
    tipo?: true
    estado?: true
    archivo?: true
    ruta_temporal?: true
    actor_id?: true
    total_filas?: true
    procesadas?: true
    insertadas?: true
    actualizadas?: true
    omitidas?: true
    errores?: true
    detalle_error?: true
    fecha_creacion?: true
    fecha_inicio?: true
    fecha_fin?: true
    _all?: true
  }

  export type ImportacionMasivaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportacionMasiva to aggregate.
     */
    where?: ImportacionMasivaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportacionMasivas to fetch.
     */
    orderBy?: ImportacionMasivaOrderByWithRelationInput | ImportacionMasivaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ImportacionMasivaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportacionMasivas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportacionMasivas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ImportacionMasivas
    **/
    _count?: true | ImportacionMasivaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ImportacionMasivaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ImportacionMasivaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ImportacionMasivaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ImportacionMasivaMaxAggregateInputType
  }

  export type GetImportacionMasivaAggregateType<T extends ImportacionMasivaAggregateArgs> = {
        [P in keyof T & keyof AggregateImportacionMasiva]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateImportacionMasiva[P]>
      : GetScalarType<T[P], AggregateImportacionMasiva[P]>
  }




  export type ImportacionMasivaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportacionMasivaWhereInput
    orderBy?: ImportacionMasivaOrderByWithAggregationInput | ImportacionMasivaOrderByWithAggregationInput[]
    by: ImportacionMasivaScalarFieldEnum[] | ImportacionMasivaScalarFieldEnum
    having?: ImportacionMasivaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ImportacionMasivaCountAggregateInputType | true
    _avg?: ImportacionMasivaAvgAggregateInputType
    _sum?: ImportacionMasivaSumAggregateInputType
    _min?: ImportacionMasivaMinAggregateInputType
    _max?: ImportacionMasivaMaxAggregateInputType
  }

  export type ImportacionMasivaGroupByOutputType = {
    id_importacion: string
    tipo: string
    estado: string
    archivo: string
    ruta_temporal: string
    actor_id: string | null
    total_filas: number
    procesadas: number
    insertadas: number
    actualizadas: number
    omitidas: number
    errores: number
    detalle_error: JsonValue | null
    fecha_creacion: Date
    fecha_inicio: Date | null
    fecha_fin: Date | null
    _count: ImportacionMasivaCountAggregateOutputType | null
    _avg: ImportacionMasivaAvgAggregateOutputType | null
    _sum: ImportacionMasivaSumAggregateOutputType | null
    _min: ImportacionMasivaMinAggregateOutputType | null
    _max: ImportacionMasivaMaxAggregateOutputType | null
  }

  type GetImportacionMasivaGroupByPayload<T extends ImportacionMasivaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ImportacionMasivaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ImportacionMasivaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ImportacionMasivaGroupByOutputType[P]>
            : GetScalarType<T[P], ImportacionMasivaGroupByOutputType[P]>
        }
      >
    >


  export type ImportacionMasivaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_importacion?: boolean
    tipo?: boolean
    estado?: boolean
    archivo?: boolean
    ruta_temporal?: boolean
    actor_id?: boolean
    total_filas?: boolean
    procesadas?: boolean
    insertadas?: boolean
    actualizadas?: boolean
    omitidas?: boolean
    errores?: boolean
    detalle_error?: boolean
    fecha_creacion?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
  }, ExtArgs["result"]["importacionMasiva"]>



  export type ImportacionMasivaSelectScalar = {
    id_importacion?: boolean
    tipo?: boolean
    estado?: boolean
    archivo?: boolean
    ruta_temporal?: boolean
    actor_id?: boolean
    total_filas?: boolean
    procesadas?: boolean
    insertadas?: boolean
    actualizadas?: boolean
    omitidas?: boolean
    errores?: boolean
    detalle_error?: boolean
    fecha_creacion?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
  }

  export type ImportacionMasivaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_importacion" | "tipo" | "estado" | "archivo" | "ruta_temporal" | "actor_id" | "total_filas" | "procesadas" | "insertadas" | "actualizadas" | "omitidas" | "errores" | "detalle_error" | "fecha_creacion" | "fecha_inicio" | "fecha_fin", ExtArgs["result"]["importacionMasiva"]>

  export type $ImportacionMasivaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ImportacionMasiva"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_importacion: string
      tipo: string
      estado: string
      archivo: string
      ruta_temporal: string
      actor_id: string | null
      total_filas: number
      procesadas: number
      insertadas: number
      actualizadas: number
      omitidas: number
      errores: number
      detalle_error: Prisma.JsonValue | null
      fecha_creacion: Date
      fecha_inicio: Date | null
      fecha_fin: Date | null
    }, ExtArgs["result"]["importacionMasiva"]>
    composites: {}
  }

  type ImportacionMasivaGetPayload<S extends boolean | null | undefined | ImportacionMasivaDefaultArgs> = $Result.GetResult<Prisma.$ImportacionMasivaPayload, S>

  type ImportacionMasivaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ImportacionMasivaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ImportacionMasivaCountAggregateInputType | true
    }

  export interface ImportacionMasivaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ImportacionMasiva'], meta: { name: 'ImportacionMasiva' } }
    /**
     * Find zero or one ImportacionMasiva that matches the filter.
     * @param {ImportacionMasivaFindUniqueArgs} args - Arguments to find a ImportacionMasiva
     * @example
     * // Get one ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ImportacionMasivaFindUniqueArgs>(args: SelectSubset<T, ImportacionMasivaFindUniqueArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ImportacionMasiva that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ImportacionMasivaFindUniqueOrThrowArgs} args - Arguments to find a ImportacionMasiva
     * @example
     * // Get one ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ImportacionMasivaFindUniqueOrThrowArgs>(args: SelectSubset<T, ImportacionMasivaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ImportacionMasiva that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaFindFirstArgs} args - Arguments to find a ImportacionMasiva
     * @example
     * // Get one ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ImportacionMasivaFindFirstArgs>(args?: SelectSubset<T, ImportacionMasivaFindFirstArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ImportacionMasiva that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaFindFirstOrThrowArgs} args - Arguments to find a ImportacionMasiva
     * @example
     * // Get one ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ImportacionMasivaFindFirstOrThrowArgs>(args?: SelectSubset<T, ImportacionMasivaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ImportacionMasivas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ImportacionMasivas
     * const importacionMasivas = await prisma.importacionMasiva.findMany()
     * 
     * // Get first 10 ImportacionMasivas
     * const importacionMasivas = await prisma.importacionMasiva.findMany({ take: 10 })
     * 
     * // Only select the `id_importacion`
     * const importacionMasivaWithId_importacionOnly = await prisma.importacionMasiva.findMany({ select: { id_importacion: true } })
     * 
     */
    findMany<T extends ImportacionMasivaFindManyArgs>(args?: SelectSubset<T, ImportacionMasivaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ImportacionMasiva.
     * @param {ImportacionMasivaCreateArgs} args - Arguments to create a ImportacionMasiva.
     * @example
     * // Create one ImportacionMasiva
     * const ImportacionMasiva = await prisma.importacionMasiva.create({
     *   data: {
     *     // ... data to create a ImportacionMasiva
     *   }
     * })
     * 
     */
    create<T extends ImportacionMasivaCreateArgs>(args: SelectSubset<T, ImportacionMasivaCreateArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ImportacionMasivas.
     * @param {ImportacionMasivaCreateManyArgs} args - Arguments to create many ImportacionMasivas.
     * @example
     * // Create many ImportacionMasivas
     * const importacionMasiva = await prisma.importacionMasiva.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ImportacionMasivaCreateManyArgs>(args?: SelectSubset<T, ImportacionMasivaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ImportacionMasiva.
     * @param {ImportacionMasivaDeleteArgs} args - Arguments to delete one ImportacionMasiva.
     * @example
     * // Delete one ImportacionMasiva
     * const ImportacionMasiva = await prisma.importacionMasiva.delete({
     *   where: {
     *     // ... filter to delete one ImportacionMasiva
     *   }
     * })
     * 
     */
    delete<T extends ImportacionMasivaDeleteArgs>(args: SelectSubset<T, ImportacionMasivaDeleteArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ImportacionMasiva.
     * @param {ImportacionMasivaUpdateArgs} args - Arguments to update one ImportacionMasiva.
     * @example
     * // Update one ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ImportacionMasivaUpdateArgs>(args: SelectSubset<T, ImportacionMasivaUpdateArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ImportacionMasivas.
     * @param {ImportacionMasivaDeleteManyArgs} args - Arguments to filter ImportacionMasivas to delete.
     * @example
     * // Delete a few ImportacionMasivas
     * const { count } = await prisma.importacionMasiva.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ImportacionMasivaDeleteManyArgs>(args?: SelectSubset<T, ImportacionMasivaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ImportacionMasivas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ImportacionMasivas
     * const importacionMasiva = await prisma.importacionMasiva.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ImportacionMasivaUpdateManyArgs>(args: SelectSubset<T, ImportacionMasivaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ImportacionMasiva.
     * @param {ImportacionMasivaUpsertArgs} args - Arguments to update or create a ImportacionMasiva.
     * @example
     * // Update or create a ImportacionMasiva
     * const importacionMasiva = await prisma.importacionMasiva.upsert({
     *   create: {
     *     // ... data to create a ImportacionMasiva
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ImportacionMasiva we want to update
     *   }
     * })
     */
    upsert<T extends ImportacionMasivaUpsertArgs>(args: SelectSubset<T, ImportacionMasivaUpsertArgs<ExtArgs>>): Prisma__ImportacionMasivaClient<$Result.GetResult<Prisma.$ImportacionMasivaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ImportacionMasivas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaCountArgs} args - Arguments to filter ImportacionMasivas to count.
     * @example
     * // Count the number of ImportacionMasivas
     * const count = await prisma.importacionMasiva.count({
     *   where: {
     *     // ... the filter for the ImportacionMasivas we want to count
     *   }
     * })
    **/
    count<T extends ImportacionMasivaCountArgs>(
      args?: Subset<T, ImportacionMasivaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ImportacionMasivaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ImportacionMasiva.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ImportacionMasivaAggregateArgs>(args: Subset<T, ImportacionMasivaAggregateArgs>): Prisma.PrismaPromise<GetImportacionMasivaAggregateType<T>>

    /**
     * Group by ImportacionMasiva.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportacionMasivaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ImportacionMasivaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ImportacionMasivaGroupByArgs['orderBy'] }
        : { orderBy?: ImportacionMasivaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ImportacionMasivaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetImportacionMasivaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ImportacionMasiva model
   */
  readonly fields: ImportacionMasivaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ImportacionMasiva.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ImportacionMasivaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ImportacionMasiva model
   */
  interface ImportacionMasivaFieldRefs {
    readonly id_importacion: FieldRef<"ImportacionMasiva", 'String'>
    readonly tipo: FieldRef<"ImportacionMasiva", 'String'>
    readonly estado: FieldRef<"ImportacionMasiva", 'String'>
    readonly archivo: FieldRef<"ImportacionMasiva", 'String'>
    readonly ruta_temporal: FieldRef<"ImportacionMasiva", 'String'>
    readonly actor_id: FieldRef<"ImportacionMasiva", 'String'>
    readonly total_filas: FieldRef<"ImportacionMasiva", 'Int'>
    readonly procesadas: FieldRef<"ImportacionMasiva", 'Int'>
    readonly insertadas: FieldRef<"ImportacionMasiva", 'Int'>
    readonly actualizadas: FieldRef<"ImportacionMasiva", 'Int'>
    readonly omitidas: FieldRef<"ImportacionMasiva", 'Int'>
    readonly errores: FieldRef<"ImportacionMasiva", 'Int'>
    readonly detalle_error: FieldRef<"ImportacionMasiva", 'Json'>
    readonly fecha_creacion: FieldRef<"ImportacionMasiva", 'DateTime'>
    readonly fecha_inicio: FieldRef<"ImportacionMasiva", 'DateTime'>
    readonly fecha_fin: FieldRef<"ImportacionMasiva", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ImportacionMasiva findUnique
   */
  export type ImportacionMasivaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter, which ImportacionMasiva to fetch.
     */
    where: ImportacionMasivaWhereUniqueInput
  }

  /**
   * ImportacionMasiva findUniqueOrThrow
   */
  export type ImportacionMasivaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter, which ImportacionMasiva to fetch.
     */
    where: ImportacionMasivaWhereUniqueInput
  }

  /**
   * ImportacionMasiva findFirst
   */
  export type ImportacionMasivaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter, which ImportacionMasiva to fetch.
     */
    where?: ImportacionMasivaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportacionMasivas to fetch.
     */
    orderBy?: ImportacionMasivaOrderByWithRelationInput | ImportacionMasivaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportacionMasivas.
     */
    cursor?: ImportacionMasivaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportacionMasivas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportacionMasivas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportacionMasivas.
     */
    distinct?: ImportacionMasivaScalarFieldEnum | ImportacionMasivaScalarFieldEnum[]
  }

  /**
   * ImportacionMasiva findFirstOrThrow
   */
  export type ImportacionMasivaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter, which ImportacionMasiva to fetch.
     */
    where?: ImportacionMasivaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportacionMasivas to fetch.
     */
    orderBy?: ImportacionMasivaOrderByWithRelationInput | ImportacionMasivaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportacionMasivas.
     */
    cursor?: ImportacionMasivaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportacionMasivas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportacionMasivas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportacionMasivas.
     */
    distinct?: ImportacionMasivaScalarFieldEnum | ImportacionMasivaScalarFieldEnum[]
  }

  /**
   * ImportacionMasiva findMany
   */
  export type ImportacionMasivaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter, which ImportacionMasivas to fetch.
     */
    where?: ImportacionMasivaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportacionMasivas to fetch.
     */
    orderBy?: ImportacionMasivaOrderByWithRelationInput | ImportacionMasivaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ImportacionMasivas.
     */
    cursor?: ImportacionMasivaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportacionMasivas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportacionMasivas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportacionMasivas.
     */
    distinct?: ImportacionMasivaScalarFieldEnum | ImportacionMasivaScalarFieldEnum[]
  }

  /**
   * ImportacionMasiva create
   */
  export type ImportacionMasivaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * The data needed to create a ImportacionMasiva.
     */
    data: XOR<ImportacionMasivaCreateInput, ImportacionMasivaUncheckedCreateInput>
  }

  /**
   * ImportacionMasiva createMany
   */
  export type ImportacionMasivaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ImportacionMasivas.
     */
    data: ImportacionMasivaCreateManyInput | ImportacionMasivaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ImportacionMasiva update
   */
  export type ImportacionMasivaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * The data needed to update a ImportacionMasiva.
     */
    data: XOR<ImportacionMasivaUpdateInput, ImportacionMasivaUncheckedUpdateInput>
    /**
     * Choose, which ImportacionMasiva to update.
     */
    where: ImportacionMasivaWhereUniqueInput
  }

  /**
   * ImportacionMasiva updateMany
   */
  export type ImportacionMasivaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ImportacionMasivas.
     */
    data: XOR<ImportacionMasivaUpdateManyMutationInput, ImportacionMasivaUncheckedUpdateManyInput>
    /**
     * Filter which ImportacionMasivas to update
     */
    where?: ImportacionMasivaWhereInput
    /**
     * Limit how many ImportacionMasivas to update.
     */
    limit?: number
  }

  /**
   * ImportacionMasiva upsert
   */
  export type ImportacionMasivaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * The filter to search for the ImportacionMasiva to update in case it exists.
     */
    where: ImportacionMasivaWhereUniqueInput
    /**
     * In case the ImportacionMasiva found by the `where` argument doesn't exist, create a new ImportacionMasiva with this data.
     */
    create: XOR<ImportacionMasivaCreateInput, ImportacionMasivaUncheckedCreateInput>
    /**
     * In case the ImportacionMasiva was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ImportacionMasivaUpdateInput, ImportacionMasivaUncheckedUpdateInput>
  }

  /**
   * ImportacionMasiva delete
   */
  export type ImportacionMasivaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
    /**
     * Filter which ImportacionMasiva to delete.
     */
    where: ImportacionMasivaWhereUniqueInput
  }

  /**
   * ImportacionMasiva deleteMany
   */
  export type ImportacionMasivaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportacionMasivas to delete
     */
    where?: ImportacionMasivaWhereInput
    /**
     * Limit how many ImportacionMasivas to delete.
     */
    limit?: number
  }

  /**
   * ImportacionMasiva without action
   */
  export type ImportacionMasivaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportacionMasiva
     */
    select?: ImportacionMasivaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ImportacionMasiva
     */
    omit?: ImportacionMasivaOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsuarioScalarFieldEnum: {
    id_usuario: 'id_usuario',
    username: 'username',
    nombres: 'nombres',
    apellidos: 'apellidos',
    email: 'email',
    sede: 'sede',
    departamento: 'departamento',
    password_hash: 'password_hash',
    rol: 'rol',
    estado: 'estado',
    fecha_creacion: 'fecha_creacion',
    mfa_habilitado: 'mfa_habilitado',
    mfa_requerido: 'mfa_requerido',
    mfa_exento: 'mfa_exento',
    mfa_secreto: 'mfa_secreto',
    mfa_ultimo_uso: 'mfa_ultimo_uso',
    token_version: 'token_version',
    intentos_fallidos: 'intentos_fallidos',
    bloqueado_hasta: 'bloqueado_hasta',
    ultimo_acceso: 'ultimo_acceso',
    password_cambio: 'password_cambio',
    latitud: 'latitud',
    longitud: 'longitud'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const TrackingUbicacionScalarFieldEnum: {
    id_tracking: 'id_tracking',
    id_usuario: 'id_usuario',
    latitud: 'latitud',
    longitud: 'longitud',
    precision_metros: 'precision_metros',
    registrado_en: 'registrado_en'
  };

  export type TrackingUbicacionScalarFieldEnum = (typeof TrackingUbicacionScalarFieldEnum)[keyof typeof TrackingUbicacionScalarFieldEnum]


  export const DispositivoAutorizadoScalarFieldEnum: {
    id_dispositivo: 'id_dispositivo',
    id_usuario: 'id_usuario',
    device_id: 'device_id',
    nombre_dispositivo: 'nombre_dispositivo',
    activo: 'activo',
    primer_uso: 'primer_uso',
    ultimo_uso: 'ultimo_uso'
  };

  export type DispositivoAutorizadoScalarFieldEnum = (typeof DispositivoAutorizadoScalarFieldEnum)[keyof typeof DispositivoAutorizadoScalarFieldEnum]


  export const ExpedienteScalarFieldEnum: {
    id_expediente: 'id_expediente',
    codigo_expediente: 'codigo_expediente',
    tipo_credito: 'tipo_credito',
    oficina: 'oficina',
    tipo_documento_cliente: 'tipo_documento_cliente',
    numero_documento_cliente: 'numero_documento_cliente',
    nombres_cliente: 'nombres_cliente',
    telefono_cliente: 'telefono_cliente',
    direccion_domicilio: 'direccion_domicilio',
    distrito: 'distrito',
    provincia: 'provincia',
    departamento: 'departamento',
    latitud: 'latitud',
    longitud: 'longitud',
    asesor_responsable: 'asesor_responsable',
    monto_desembolso: 'monto_desembolso',
    moneda: 'moneda',
    datos_cliente: 'datos_cliente',
    datos_negocio: 'datos_negocio',
    datos_credito: 'datos_credito',
    evaluacion_financiera: 'evaluacion_financiera',
    endeudamiento: 'endeudamiento',
    estado: 'estado',
    fecha_creacion: 'fecha_creacion',
    fecha_actualizar: 'fecha_actualizar'
  };

  export type ExpedienteScalarFieldEnum = (typeof ExpedienteScalarFieldEnum)[keyof typeof ExpedienteScalarFieldEnum]


  export const AsignacionAuditoriaScalarFieldEnum: {
    id_asignacion: 'id_asignacion',
    id_expediente: 'id_expediente',
    id_usuario_auditor: 'id_usuario_auditor',
    fecha_asignacion: 'fecha_asignacion',
    fecha_fin: 'fecha_fin',
    estado: 'estado',
    prioridad: 'prioridad'
  };

  export type AsignacionAuditoriaScalarFieldEnum = (typeof AsignacionAuditoriaScalarFieldEnum)[keyof typeof AsignacionAuditoriaScalarFieldEnum]


  export const VisitaAuditoriaScalarFieldEnum: {
    id_visita: 'id_visita',
    client_sync_id: 'client_sync_id',
    id_asignacion: 'id_asignacion',
    id_expediente: 'id_expediente',
    id_usuario_auditor: 'id_usuario_auditor',
    fecha_hora_checkin: 'fecha_hora_checkin',
    fecha_hora_checkout: 'fecha_hora_checkout',
    latitud: 'latitud',
    longitud: 'longitud',
    precision_metros: 'precision_metros',
    distancia_domicilio_m: 'distancia_domicilio_m',
    mock_location: 'mock_location',
    device_integrity_ok: 'device_integrity_ok',
    device_id: 'device_id',
    server_received_at: 'server_received_at',
    resultado: 'resultado',
    respuestas_cuestionario: 'respuestas_cuestionario',
    comentario_negocio: 'comentario_negocio',
    comentario_auditor: 'comentario_auditor',
    otros_clientes_domicilio: 'otros_clientes_domicilio',
    otros_ingresos: 'otros_ingresos',
    firma_evidencia: 'firma_evidencia',
    estado: 'estado',
    fecha_creacion: 'fecha_creacion',
    fecha_actualizar: 'fecha_actualizar'
  };

  export type VisitaAuditoriaScalarFieldEnum = (typeof VisitaAuditoriaScalarFieldEnum)[keyof typeof VisitaAuditoriaScalarFieldEnum]


  export const EvidenciaScalarFieldEnum: {
    id_evidencia: 'id_evidencia',
    id_visita: 'id_visita',
    tipo: 'tipo',
    object_key: 'object_key',
    hash_sha256: 'hash_sha256',
    latitud_captura: 'latitud_captura',
    longitud_captura: 'longitud_captura',
    capturado_en: 'capturado_en',
    fecha_creacion: 'fecha_creacion'
  };

  export type EvidenciaScalarFieldEnum = (typeof EvidenciaScalarFieldEnum)[keyof typeof EvidenciaScalarFieldEnum]


  export const AuditoriaSeguridadScalarFieldEnum: {
    id_auditoria: 'id_auditoria',
    fecha: 'fecha',
    request_id: 'request_id',
    actor_id: 'actor_id',
    actor: 'actor',
    rol: 'rol',
    metodo: 'metodo',
    ruta: 'ruta',
    estado_http: 'estado_http',
    ip_address: 'ip_address',
    ip_hash: 'ip_hash',
    user_agent: 'user_agent',
    device_id: 'device_id',
    mock_location: 'mock_location'
  };

  export type AuditoriaSeguridadScalarFieldEnum = (typeof AuditoriaSeguridadScalarFieldEnum)[keyof typeof AuditoriaSeguridadScalarFieldEnum]


  export const ImportacionMasivaScalarFieldEnum: {
    id_importacion: 'id_importacion',
    tipo: 'tipo',
    estado: 'estado',
    archivo: 'archivo',
    ruta_temporal: 'ruta_temporal',
    actor_id: 'actor_id',
    total_filas: 'total_filas',
    procesadas: 'procesadas',
    insertadas: 'insertadas',
    actualizadas: 'actualizadas',
    omitidas: 'omitidas',
    errores: 'errores',
    detalle_error: 'detalle_error',
    fecha_creacion: 'fecha_creacion',
    fecha_inicio: 'fecha_inicio',
    fecha_fin: 'fecha_fin'
  };

  export type ImportacionMasivaScalarFieldEnum = (typeof ImportacionMasivaScalarFieldEnum)[keyof typeof ImportacionMasivaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const UsuarioOrderByRelevanceFieldEnum: {
    id_usuario: 'id_usuario',
    username: 'username',
    nombres: 'nombres',
    apellidos: 'apellidos',
    email: 'email',
    sede: 'sede',
    departamento: 'departamento',
    password_hash: 'password_hash',
    rol: 'rol',
    estado: 'estado',
    mfa_secreto: 'mfa_secreto'
  };

  export type UsuarioOrderByRelevanceFieldEnum = (typeof UsuarioOrderByRelevanceFieldEnum)[keyof typeof UsuarioOrderByRelevanceFieldEnum]


  export const TrackingUbicacionOrderByRelevanceFieldEnum: {
    id_usuario: 'id_usuario'
  };

  export type TrackingUbicacionOrderByRelevanceFieldEnum = (typeof TrackingUbicacionOrderByRelevanceFieldEnum)[keyof typeof TrackingUbicacionOrderByRelevanceFieldEnum]


  export const DispositivoAutorizadoOrderByRelevanceFieldEnum: {
    id_dispositivo: 'id_dispositivo',
    id_usuario: 'id_usuario',
    device_id: 'device_id',
    nombre_dispositivo: 'nombre_dispositivo'
  };

  export type DispositivoAutorizadoOrderByRelevanceFieldEnum = (typeof DispositivoAutorizadoOrderByRelevanceFieldEnum)[keyof typeof DispositivoAutorizadoOrderByRelevanceFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const ExpedienteOrderByRelevanceFieldEnum: {
    codigo_expediente: 'codigo_expediente',
    oficina: 'oficina',
    numero_documento_cliente: 'numero_documento_cliente',
    nombres_cliente: 'nombres_cliente',
    telefono_cliente: 'telefono_cliente',
    direccion_domicilio: 'direccion_domicilio',
    distrito: 'distrito',
    provincia: 'provincia',
    departamento: 'departamento',
    asesor_responsable: 'asesor_responsable',
    moneda: 'moneda',
    estado: 'estado'
  };

  export type ExpedienteOrderByRelevanceFieldEnum = (typeof ExpedienteOrderByRelevanceFieldEnum)[keyof typeof ExpedienteOrderByRelevanceFieldEnum]


  export const AsignacionAuditoriaOrderByRelevanceFieldEnum: {
    id_usuario_auditor: 'id_usuario_auditor',
    estado: 'estado',
    prioridad: 'prioridad'
  };

  export type AsignacionAuditoriaOrderByRelevanceFieldEnum = (typeof AsignacionAuditoriaOrderByRelevanceFieldEnum)[keyof typeof AsignacionAuditoriaOrderByRelevanceFieldEnum]


  export const VisitaAuditoriaOrderByRelevanceFieldEnum: {
    client_sync_id: 'client_sync_id',
    id_usuario_auditor: 'id_usuario_auditor',
    device_id: 'device_id',
    resultado: 'resultado',
    comentario_negocio: 'comentario_negocio',
    comentario_auditor: 'comentario_auditor',
    firma_evidencia: 'firma_evidencia',
    estado: 'estado'
  };

  export type VisitaAuditoriaOrderByRelevanceFieldEnum = (typeof VisitaAuditoriaOrderByRelevanceFieldEnum)[keyof typeof VisitaAuditoriaOrderByRelevanceFieldEnum]


  export const EvidenciaOrderByRelevanceFieldEnum: {
    id_evidencia: 'id_evidencia',
    tipo: 'tipo',
    object_key: 'object_key',
    hash_sha256: 'hash_sha256'
  };

  export type EvidenciaOrderByRelevanceFieldEnum = (typeof EvidenciaOrderByRelevanceFieldEnum)[keyof typeof EvidenciaOrderByRelevanceFieldEnum]


  export const AuditoriaSeguridadOrderByRelevanceFieldEnum: {
    id_auditoria: 'id_auditoria',
    request_id: 'request_id',
    actor_id: 'actor_id',
    actor: 'actor',
    rol: 'rol',
    metodo: 'metodo',
    ruta: 'ruta',
    ip_address: 'ip_address',
    ip_hash: 'ip_hash',
    user_agent: 'user_agent',
    device_id: 'device_id'
  };

  export type AuditoriaSeguridadOrderByRelevanceFieldEnum = (typeof AuditoriaSeguridadOrderByRelevanceFieldEnum)[keyof typeof AuditoriaSeguridadOrderByRelevanceFieldEnum]


  export const ImportacionMasivaOrderByRelevanceFieldEnum: {
    id_importacion: 'id_importacion',
    tipo: 'tipo',
    estado: 'estado',
    archivo: 'archivo',
    ruta_temporal: 'ruta_temporal',
    actor_id: 'actor_id'
  };

  export type ImportacionMasivaOrderByRelevanceFieldEnum = (typeof ImportacionMasivaOrderByRelevanceFieldEnum)[keyof typeof ImportacionMasivaOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'TipoCredito'
   */
  export type EnumTipoCreditoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoCredito'>
    


  /**
   * Reference to a field of type 'TipoDocumento'
   */
  export type EnumTipoDocumentoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoDocumento'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    id_usuario?: StringFilter<"Usuario"> | string
    username?: StringFilter<"Usuario"> | string
    nombres?: StringNullableFilter<"Usuario"> | string | null
    apellidos?: StringNullableFilter<"Usuario"> | string | null
    email?: StringNullableFilter<"Usuario"> | string | null
    sede?: StringNullableFilter<"Usuario"> | string | null
    departamento?: StringNullableFilter<"Usuario"> | string | null
    password_hash?: StringFilter<"Usuario"> | string
    rol?: StringFilter<"Usuario"> | string
    estado?: StringFilter<"Usuario"> | string
    fecha_creacion?: DateTimeFilter<"Usuario"> | Date | string
    mfa_habilitado?: BoolFilter<"Usuario"> | boolean
    mfa_requerido?: BoolFilter<"Usuario"> | boolean
    mfa_exento?: BoolFilter<"Usuario"> | boolean
    mfa_secreto?: StringNullableFilter<"Usuario"> | string | null
    mfa_ultimo_uso?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    token_version?: IntFilter<"Usuario"> | number
    intentos_fallidos?: IntFilter<"Usuario"> | number
    bloqueado_hasta?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    ultimo_acceso?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    password_cambio?: DateTimeFilter<"Usuario"> | Date | string
    latitud?: DecimalNullableFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaListRelationFilter
    visitas?: VisitaAuditoriaListRelationFilter
    dispositivos?: DispositivoAutorizadoListRelationFilter
    trackings?: TrackingUbicacionListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    id_usuario?: SortOrder
    username?: SortOrder
    nombres?: SortOrderInput | SortOrder
    apellidos?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    sede?: SortOrderInput | SortOrder
    departamento?: SortOrderInput | SortOrder
    password_hash?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    mfa_habilitado?: SortOrder
    mfa_requerido?: SortOrder
    mfa_exento?: SortOrder
    mfa_secreto?: SortOrderInput | SortOrder
    mfa_ultimo_uso?: SortOrderInput | SortOrder
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    bloqueado_hasta?: SortOrderInput | SortOrder
    ultimo_acceso?: SortOrderInput | SortOrder
    password_cambio?: SortOrder
    latitud?: SortOrderInput | SortOrder
    longitud?: SortOrderInput | SortOrder
    asignaciones?: AsignacionAuditoriaOrderByRelationAggregateInput
    visitas?: VisitaAuditoriaOrderByRelationAggregateInput
    dispositivos?: DispositivoAutorizadoOrderByRelationAggregateInput
    trackings?: TrackingUbicacionOrderByRelationAggregateInput
    _relevance?: UsuarioOrderByRelevanceInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id_usuario?: string
    username?: string
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    nombres?: StringNullableFilter<"Usuario"> | string | null
    apellidos?: StringNullableFilter<"Usuario"> | string | null
    email?: StringNullableFilter<"Usuario"> | string | null
    sede?: StringNullableFilter<"Usuario"> | string | null
    departamento?: StringNullableFilter<"Usuario"> | string | null
    password_hash?: StringFilter<"Usuario"> | string
    rol?: StringFilter<"Usuario"> | string
    estado?: StringFilter<"Usuario"> | string
    fecha_creacion?: DateTimeFilter<"Usuario"> | Date | string
    mfa_habilitado?: BoolFilter<"Usuario"> | boolean
    mfa_requerido?: BoolFilter<"Usuario"> | boolean
    mfa_exento?: BoolFilter<"Usuario"> | boolean
    mfa_secreto?: StringNullableFilter<"Usuario"> | string | null
    mfa_ultimo_uso?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    token_version?: IntFilter<"Usuario"> | number
    intentos_fallidos?: IntFilter<"Usuario"> | number
    bloqueado_hasta?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    ultimo_acceso?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    password_cambio?: DateTimeFilter<"Usuario"> | Date | string
    latitud?: DecimalNullableFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaListRelationFilter
    visitas?: VisitaAuditoriaListRelationFilter
    dispositivos?: DispositivoAutorizadoListRelationFilter
    trackings?: TrackingUbicacionListRelationFilter
  }, "id_usuario" | "username">

  export type UsuarioOrderByWithAggregationInput = {
    id_usuario?: SortOrder
    username?: SortOrder
    nombres?: SortOrderInput | SortOrder
    apellidos?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    sede?: SortOrderInput | SortOrder
    departamento?: SortOrderInput | SortOrder
    password_hash?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    mfa_habilitado?: SortOrder
    mfa_requerido?: SortOrder
    mfa_exento?: SortOrder
    mfa_secreto?: SortOrderInput | SortOrder
    mfa_ultimo_uso?: SortOrderInput | SortOrder
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    bloqueado_hasta?: SortOrderInput | SortOrder
    ultimo_acceso?: SortOrderInput | SortOrder
    password_cambio?: SortOrder
    latitud?: SortOrderInput | SortOrder
    longitud?: SortOrderInput | SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _avg?: UsuarioAvgOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
    _sum?: UsuarioSumOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    id_usuario?: StringWithAggregatesFilter<"Usuario"> | string
    username?: StringWithAggregatesFilter<"Usuario"> | string
    nombres?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    apellidos?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    email?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    sede?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    departamento?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    password_hash?: StringWithAggregatesFilter<"Usuario"> | string
    rol?: StringWithAggregatesFilter<"Usuario"> | string
    estado?: StringWithAggregatesFilter<"Usuario"> | string
    fecha_creacion?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    mfa_habilitado?: BoolWithAggregatesFilter<"Usuario"> | boolean
    mfa_requerido?: BoolWithAggregatesFilter<"Usuario"> | boolean
    mfa_exento?: BoolWithAggregatesFilter<"Usuario"> | boolean
    mfa_secreto?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    mfa_ultimo_uso?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    token_version?: IntWithAggregatesFilter<"Usuario"> | number
    intentos_fallidos?: IntWithAggregatesFilter<"Usuario"> | number
    bloqueado_hasta?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    ultimo_acceso?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    password_cambio?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    latitud?: DecimalNullableWithAggregatesFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableWithAggregatesFilter<"Usuario"> | Decimal | DecimalJsLike | number | string | null
  }

  export type TrackingUbicacionWhereInput = {
    AND?: TrackingUbicacionWhereInput | TrackingUbicacionWhereInput[]
    OR?: TrackingUbicacionWhereInput[]
    NOT?: TrackingUbicacionWhereInput | TrackingUbicacionWhereInput[]
    id_tracking?: BigIntFilter<"TrackingUbicacion"> | bigint | number
    id_usuario?: StringFilter<"TrackingUbicacion"> | string
    latitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFilter<"TrackingUbicacion"> | Date | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type TrackingUbicacionOrderByWithRelationInput = {
    id_tracking?: SortOrder
    id_usuario?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrderInput | SortOrder
    registrado_en?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
    _relevance?: TrackingUbicacionOrderByRelevanceInput
  }

  export type TrackingUbicacionWhereUniqueInput = Prisma.AtLeast<{
    id_tracking?: bigint | number
    AND?: TrackingUbicacionWhereInput | TrackingUbicacionWhereInput[]
    OR?: TrackingUbicacionWhereInput[]
    NOT?: TrackingUbicacionWhereInput | TrackingUbicacionWhereInput[]
    id_usuario?: StringFilter<"TrackingUbicacion"> | string
    latitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFilter<"TrackingUbicacion"> | Date | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id_tracking">

  export type TrackingUbicacionOrderByWithAggregationInput = {
    id_tracking?: SortOrder
    id_usuario?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrderInput | SortOrder
    registrado_en?: SortOrder
    _count?: TrackingUbicacionCountOrderByAggregateInput
    _avg?: TrackingUbicacionAvgOrderByAggregateInput
    _max?: TrackingUbicacionMaxOrderByAggregateInput
    _min?: TrackingUbicacionMinOrderByAggregateInput
    _sum?: TrackingUbicacionSumOrderByAggregateInput
  }

  export type TrackingUbicacionScalarWhereWithAggregatesInput = {
    AND?: TrackingUbicacionScalarWhereWithAggregatesInput | TrackingUbicacionScalarWhereWithAggregatesInput[]
    OR?: TrackingUbicacionScalarWhereWithAggregatesInput[]
    NOT?: TrackingUbicacionScalarWhereWithAggregatesInput | TrackingUbicacionScalarWhereWithAggregatesInput[]
    id_tracking?: BigIntWithAggregatesFilter<"TrackingUbicacion"> | bigint | number
    id_usuario?: StringWithAggregatesFilter<"TrackingUbicacion"> | string
    latitud?: DecimalWithAggregatesFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalWithAggregatesFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableWithAggregatesFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeWithAggregatesFilter<"TrackingUbicacion"> | Date | string
  }

  export type DispositivoAutorizadoWhereInput = {
    AND?: DispositivoAutorizadoWhereInput | DispositivoAutorizadoWhereInput[]
    OR?: DispositivoAutorizadoWhereInput[]
    NOT?: DispositivoAutorizadoWhereInput | DispositivoAutorizadoWhereInput[]
    id_dispositivo?: StringFilter<"DispositivoAutorizado"> | string
    id_usuario?: StringFilter<"DispositivoAutorizado"> | string
    device_id?: StringFilter<"DispositivoAutorizado"> | string
    nombre_dispositivo?: StringNullableFilter<"DispositivoAutorizado"> | string | null
    activo?: BoolFilter<"DispositivoAutorizado"> | boolean
    primer_uso?: DateTimeFilter<"DispositivoAutorizado"> | Date | string
    ultimo_uso?: DateTimeNullableFilter<"DispositivoAutorizado"> | Date | string | null
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type DispositivoAutorizadoOrderByWithRelationInput = {
    id_dispositivo?: SortOrder
    id_usuario?: SortOrder
    device_id?: SortOrder
    nombre_dispositivo?: SortOrderInput | SortOrder
    activo?: SortOrder
    primer_uso?: SortOrder
    ultimo_uso?: SortOrderInput | SortOrder
    usuario?: UsuarioOrderByWithRelationInput
    _relevance?: DispositivoAutorizadoOrderByRelevanceInput
  }

  export type DispositivoAutorizadoWhereUniqueInput = Prisma.AtLeast<{
    id_dispositivo?: string
    id_usuario_device_id?: DispositivoAutorizadoId_usuarioDevice_idCompoundUniqueInput
    AND?: DispositivoAutorizadoWhereInput | DispositivoAutorizadoWhereInput[]
    OR?: DispositivoAutorizadoWhereInput[]
    NOT?: DispositivoAutorizadoWhereInput | DispositivoAutorizadoWhereInput[]
    id_usuario?: StringFilter<"DispositivoAutorizado"> | string
    device_id?: StringFilter<"DispositivoAutorizado"> | string
    nombre_dispositivo?: StringNullableFilter<"DispositivoAutorizado"> | string | null
    activo?: BoolFilter<"DispositivoAutorizado"> | boolean
    primer_uso?: DateTimeFilter<"DispositivoAutorizado"> | Date | string
    ultimo_uso?: DateTimeNullableFilter<"DispositivoAutorizado"> | Date | string | null
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id_dispositivo" | "id_usuario_device_id">

  export type DispositivoAutorizadoOrderByWithAggregationInput = {
    id_dispositivo?: SortOrder
    id_usuario?: SortOrder
    device_id?: SortOrder
    nombre_dispositivo?: SortOrderInput | SortOrder
    activo?: SortOrder
    primer_uso?: SortOrder
    ultimo_uso?: SortOrderInput | SortOrder
    _count?: DispositivoAutorizadoCountOrderByAggregateInput
    _max?: DispositivoAutorizadoMaxOrderByAggregateInput
    _min?: DispositivoAutorizadoMinOrderByAggregateInput
  }

  export type DispositivoAutorizadoScalarWhereWithAggregatesInput = {
    AND?: DispositivoAutorizadoScalarWhereWithAggregatesInput | DispositivoAutorizadoScalarWhereWithAggregatesInput[]
    OR?: DispositivoAutorizadoScalarWhereWithAggregatesInput[]
    NOT?: DispositivoAutorizadoScalarWhereWithAggregatesInput | DispositivoAutorizadoScalarWhereWithAggregatesInput[]
    id_dispositivo?: StringWithAggregatesFilter<"DispositivoAutorizado"> | string
    id_usuario?: StringWithAggregatesFilter<"DispositivoAutorizado"> | string
    device_id?: StringWithAggregatesFilter<"DispositivoAutorizado"> | string
    nombre_dispositivo?: StringNullableWithAggregatesFilter<"DispositivoAutorizado"> | string | null
    activo?: BoolWithAggregatesFilter<"DispositivoAutorizado"> | boolean
    primer_uso?: DateTimeWithAggregatesFilter<"DispositivoAutorizado"> | Date | string
    ultimo_uso?: DateTimeNullableWithAggregatesFilter<"DispositivoAutorizado"> | Date | string | null
  }

  export type ExpedienteWhereInput = {
    AND?: ExpedienteWhereInput | ExpedienteWhereInput[]
    OR?: ExpedienteWhereInput[]
    NOT?: ExpedienteWhereInput | ExpedienteWhereInput[]
    id_expediente?: IntFilter<"Expediente"> | number
    codigo_expediente?: StringFilter<"Expediente"> | string
    tipo_credito?: EnumTipoCreditoFilter<"Expediente"> | $Enums.TipoCredito
    oficina?: StringNullableFilter<"Expediente"> | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFilter<"Expediente"> | $Enums.TipoDocumento
    numero_documento_cliente?: StringFilter<"Expediente"> | string
    nombres_cliente?: StringFilter<"Expediente"> | string
    telefono_cliente?: StringNullableFilter<"Expediente"> | string | null
    direccion_domicilio?: StringNullableFilter<"Expediente"> | string | null
    distrito?: StringNullableFilter<"Expediente"> | string | null
    provincia?: StringNullableFilter<"Expediente"> | string | null
    departamento?: StringNullableFilter<"Expediente"> | string | null
    latitud?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFilter<"Expediente"> | string
    monto_desembolso?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringNullableFilter<"Expediente"> | string | null
    datos_cliente?: JsonNullableFilter<"Expediente">
    datos_negocio?: JsonNullableFilter<"Expediente">
    datos_credito?: JsonNullableFilter<"Expediente">
    evaluacion_financiera?: JsonNullableFilter<"Expediente">
    endeudamiento?: JsonNullableFilter<"Expediente">
    estado?: StringFilter<"Expediente"> | string
    fecha_creacion?: DateTimeFilter<"Expediente"> | Date | string
    fecha_actualizar?: DateTimeFilter<"Expediente"> | Date | string
    asignaciones?: AsignacionAuditoriaListRelationFilter
    visitas?: VisitaAuditoriaListRelationFilter
  }

  export type ExpedienteOrderByWithRelationInput = {
    id_expediente?: SortOrder
    codigo_expediente?: SortOrder
    tipo_credito?: SortOrder
    oficina?: SortOrderInput | SortOrder
    tipo_documento_cliente?: SortOrder
    numero_documento_cliente?: SortOrder
    nombres_cliente?: SortOrder
    telefono_cliente?: SortOrderInput | SortOrder
    direccion_domicilio?: SortOrderInput | SortOrder
    distrito?: SortOrderInput | SortOrder
    provincia?: SortOrderInput | SortOrder
    departamento?: SortOrderInput | SortOrder
    latitud?: SortOrderInput | SortOrder
    longitud?: SortOrderInput | SortOrder
    asesor_responsable?: SortOrder
    monto_desembolso?: SortOrderInput | SortOrder
    moneda?: SortOrderInput | SortOrder
    datos_cliente?: SortOrderInput | SortOrder
    datos_negocio?: SortOrderInput | SortOrder
    datos_credito?: SortOrderInput | SortOrder
    evaluacion_financiera?: SortOrderInput | SortOrder
    endeudamiento?: SortOrderInput | SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
    asignaciones?: AsignacionAuditoriaOrderByRelationAggregateInput
    visitas?: VisitaAuditoriaOrderByRelationAggregateInput
    _relevance?: ExpedienteOrderByRelevanceInput
  }

  export type ExpedienteWhereUniqueInput = Prisma.AtLeast<{
    id_expediente?: number
    codigo_expediente?: string
    AND?: ExpedienteWhereInput | ExpedienteWhereInput[]
    OR?: ExpedienteWhereInput[]
    NOT?: ExpedienteWhereInput | ExpedienteWhereInput[]
    tipo_credito?: EnumTipoCreditoFilter<"Expediente"> | $Enums.TipoCredito
    oficina?: StringNullableFilter<"Expediente"> | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFilter<"Expediente"> | $Enums.TipoDocumento
    numero_documento_cliente?: StringFilter<"Expediente"> | string
    nombres_cliente?: StringFilter<"Expediente"> | string
    telefono_cliente?: StringNullableFilter<"Expediente"> | string | null
    direccion_domicilio?: StringNullableFilter<"Expediente"> | string | null
    distrito?: StringNullableFilter<"Expediente"> | string | null
    provincia?: StringNullableFilter<"Expediente"> | string | null
    departamento?: StringNullableFilter<"Expediente"> | string | null
    latitud?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFilter<"Expediente"> | string
    monto_desembolso?: DecimalNullableFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringNullableFilter<"Expediente"> | string | null
    datos_cliente?: JsonNullableFilter<"Expediente">
    datos_negocio?: JsonNullableFilter<"Expediente">
    datos_credito?: JsonNullableFilter<"Expediente">
    evaluacion_financiera?: JsonNullableFilter<"Expediente">
    endeudamiento?: JsonNullableFilter<"Expediente">
    estado?: StringFilter<"Expediente"> | string
    fecha_creacion?: DateTimeFilter<"Expediente"> | Date | string
    fecha_actualizar?: DateTimeFilter<"Expediente"> | Date | string
    asignaciones?: AsignacionAuditoriaListRelationFilter
    visitas?: VisitaAuditoriaListRelationFilter
  }, "id_expediente" | "codigo_expediente">

  export type ExpedienteOrderByWithAggregationInput = {
    id_expediente?: SortOrder
    codigo_expediente?: SortOrder
    tipo_credito?: SortOrder
    oficina?: SortOrderInput | SortOrder
    tipo_documento_cliente?: SortOrder
    numero_documento_cliente?: SortOrder
    nombres_cliente?: SortOrder
    telefono_cliente?: SortOrderInput | SortOrder
    direccion_domicilio?: SortOrderInput | SortOrder
    distrito?: SortOrderInput | SortOrder
    provincia?: SortOrderInput | SortOrder
    departamento?: SortOrderInput | SortOrder
    latitud?: SortOrderInput | SortOrder
    longitud?: SortOrderInput | SortOrder
    asesor_responsable?: SortOrder
    monto_desembolso?: SortOrderInput | SortOrder
    moneda?: SortOrderInput | SortOrder
    datos_cliente?: SortOrderInput | SortOrder
    datos_negocio?: SortOrderInput | SortOrder
    datos_credito?: SortOrderInput | SortOrder
    evaluacion_financiera?: SortOrderInput | SortOrder
    endeudamiento?: SortOrderInput | SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
    _count?: ExpedienteCountOrderByAggregateInput
    _avg?: ExpedienteAvgOrderByAggregateInput
    _max?: ExpedienteMaxOrderByAggregateInput
    _min?: ExpedienteMinOrderByAggregateInput
    _sum?: ExpedienteSumOrderByAggregateInput
  }

  export type ExpedienteScalarWhereWithAggregatesInput = {
    AND?: ExpedienteScalarWhereWithAggregatesInput | ExpedienteScalarWhereWithAggregatesInput[]
    OR?: ExpedienteScalarWhereWithAggregatesInput[]
    NOT?: ExpedienteScalarWhereWithAggregatesInput | ExpedienteScalarWhereWithAggregatesInput[]
    id_expediente?: IntWithAggregatesFilter<"Expediente"> | number
    codigo_expediente?: StringWithAggregatesFilter<"Expediente"> | string
    tipo_credito?: EnumTipoCreditoWithAggregatesFilter<"Expediente"> | $Enums.TipoCredito
    oficina?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    tipo_documento_cliente?: EnumTipoDocumentoWithAggregatesFilter<"Expediente"> | $Enums.TipoDocumento
    numero_documento_cliente?: StringWithAggregatesFilter<"Expediente"> | string
    nombres_cliente?: StringWithAggregatesFilter<"Expediente"> | string
    telefono_cliente?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    direccion_domicilio?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    distrito?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    provincia?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    departamento?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    latitud?: DecimalNullableWithAggregatesFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    longitud?: DecimalNullableWithAggregatesFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringWithAggregatesFilter<"Expediente"> | string
    monto_desembolso?: DecimalNullableWithAggregatesFilter<"Expediente"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringNullableWithAggregatesFilter<"Expediente"> | string | null
    datos_cliente?: JsonNullableWithAggregatesFilter<"Expediente">
    datos_negocio?: JsonNullableWithAggregatesFilter<"Expediente">
    datos_credito?: JsonNullableWithAggregatesFilter<"Expediente">
    evaluacion_financiera?: JsonNullableWithAggregatesFilter<"Expediente">
    endeudamiento?: JsonNullableWithAggregatesFilter<"Expediente">
    estado?: StringWithAggregatesFilter<"Expediente"> | string
    fecha_creacion?: DateTimeWithAggregatesFilter<"Expediente"> | Date | string
    fecha_actualizar?: DateTimeWithAggregatesFilter<"Expediente"> | Date | string
  }

  export type AsignacionAuditoriaWhereInput = {
    AND?: AsignacionAuditoriaWhereInput | AsignacionAuditoriaWhereInput[]
    OR?: AsignacionAuditoriaWhereInput[]
    NOT?: AsignacionAuditoriaWhereInput | AsignacionAuditoriaWhereInput[]
    id_asignacion?: IntFilter<"AsignacionAuditoria"> | number
    id_expediente?: IntFilter<"AsignacionAuditoria"> | number
    id_usuario_auditor?: StringFilter<"AsignacionAuditoria"> | string
    fecha_asignacion?: DateTimeFilter<"AsignacionAuditoria"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionAuditoria"> | Date | string | null
    estado?: StringFilter<"AsignacionAuditoria"> | string
    prioridad?: StringFilter<"AsignacionAuditoria"> | string
    expediente?: XOR<ExpedienteScalarRelationFilter, ExpedienteWhereInput>
    auditor?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type AsignacionAuditoriaOrderByWithRelationInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_asignacion?: SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    estado?: SortOrder
    prioridad?: SortOrder
    expediente?: ExpedienteOrderByWithRelationInput
    auditor?: UsuarioOrderByWithRelationInput
    _relevance?: AsignacionAuditoriaOrderByRelevanceInput
  }

  export type AsignacionAuditoriaWhereUniqueInput = Prisma.AtLeast<{
    id_asignacion?: number
    AND?: AsignacionAuditoriaWhereInput | AsignacionAuditoriaWhereInput[]
    OR?: AsignacionAuditoriaWhereInput[]
    NOT?: AsignacionAuditoriaWhereInput | AsignacionAuditoriaWhereInput[]
    id_expediente?: IntFilter<"AsignacionAuditoria"> | number
    id_usuario_auditor?: StringFilter<"AsignacionAuditoria"> | string
    fecha_asignacion?: DateTimeFilter<"AsignacionAuditoria"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionAuditoria"> | Date | string | null
    estado?: StringFilter<"AsignacionAuditoria"> | string
    prioridad?: StringFilter<"AsignacionAuditoria"> | string
    expediente?: XOR<ExpedienteScalarRelationFilter, ExpedienteWhereInput>
    auditor?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id_asignacion">

  export type AsignacionAuditoriaOrderByWithAggregationInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_asignacion?: SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    estado?: SortOrder
    prioridad?: SortOrder
    _count?: AsignacionAuditoriaCountOrderByAggregateInput
    _avg?: AsignacionAuditoriaAvgOrderByAggregateInput
    _max?: AsignacionAuditoriaMaxOrderByAggregateInput
    _min?: AsignacionAuditoriaMinOrderByAggregateInput
    _sum?: AsignacionAuditoriaSumOrderByAggregateInput
  }

  export type AsignacionAuditoriaScalarWhereWithAggregatesInput = {
    AND?: AsignacionAuditoriaScalarWhereWithAggregatesInput | AsignacionAuditoriaScalarWhereWithAggregatesInput[]
    OR?: AsignacionAuditoriaScalarWhereWithAggregatesInput[]
    NOT?: AsignacionAuditoriaScalarWhereWithAggregatesInput | AsignacionAuditoriaScalarWhereWithAggregatesInput[]
    id_asignacion?: IntWithAggregatesFilter<"AsignacionAuditoria"> | number
    id_expediente?: IntWithAggregatesFilter<"AsignacionAuditoria"> | number
    id_usuario_auditor?: StringWithAggregatesFilter<"AsignacionAuditoria"> | string
    fecha_asignacion?: DateTimeWithAggregatesFilter<"AsignacionAuditoria"> | Date | string
    fecha_fin?: DateTimeNullableWithAggregatesFilter<"AsignacionAuditoria"> | Date | string | null
    estado?: StringWithAggregatesFilter<"AsignacionAuditoria"> | string
    prioridad?: StringWithAggregatesFilter<"AsignacionAuditoria"> | string
  }

  export type VisitaAuditoriaWhereInput = {
    AND?: VisitaAuditoriaWhereInput | VisitaAuditoriaWhereInput[]
    OR?: VisitaAuditoriaWhereInput[]
    NOT?: VisitaAuditoriaWhereInput | VisitaAuditoriaWhereInput[]
    id_visita?: IntFilter<"VisitaAuditoria"> | number
    client_sync_id?: StringNullableFilter<"VisitaAuditoria"> | string | null
    id_asignacion?: IntNullableFilter<"VisitaAuditoria"> | number | null
    id_expediente?: IntFilter<"VisitaAuditoria"> | number
    id_usuario_auditor?: StringFilter<"VisitaAuditoria"> | string
    fecha_hora_checkin?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_hora_checkout?: DateTimeNullableFilter<"VisitaAuditoria"> | Date | string | null
    latitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFilter<"VisitaAuditoria"> | boolean
    device_integrity_ok?: BoolFilter<"VisitaAuditoria"> | boolean
    device_id?: StringNullableFilter<"VisitaAuditoria"> | string | null
    server_received_at?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    resultado?: StringFilter<"VisitaAuditoria"> | string
    respuestas_cuestionario?: JsonFilter<"VisitaAuditoria">
    comentario_negocio?: StringNullableFilter<"VisitaAuditoria"> | string | null
    comentario_auditor?: StringNullableFilter<"VisitaAuditoria"> | string | null
    otros_clientes_domicilio?: JsonNullableFilter<"VisitaAuditoria">
    otros_ingresos?: JsonNullableFilter<"VisitaAuditoria">
    firma_evidencia?: StringNullableFilter<"VisitaAuditoria"> | string | null
    estado?: StringFilter<"VisitaAuditoria"> | string
    fecha_creacion?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_actualizar?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    expediente?: XOR<ExpedienteScalarRelationFilter, ExpedienteWhereInput>
    auditor?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    evidencias?: EvidenciaListRelationFilter
  }

  export type VisitaAuditoriaOrderByWithRelationInput = {
    id_visita?: SortOrder
    client_sync_id?: SortOrderInput | SortOrder
    id_asignacion?: SortOrderInput | SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_hora_checkin?: SortOrder
    fecha_hora_checkout?: SortOrderInput | SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrderInput | SortOrder
    distancia_domicilio_m?: SortOrderInput | SortOrder
    mock_location?: SortOrder
    device_integrity_ok?: SortOrder
    device_id?: SortOrderInput | SortOrder
    server_received_at?: SortOrder
    resultado?: SortOrder
    respuestas_cuestionario?: SortOrder
    comentario_negocio?: SortOrderInput | SortOrder
    comentario_auditor?: SortOrderInput | SortOrder
    otros_clientes_domicilio?: SortOrderInput | SortOrder
    otros_ingresos?: SortOrderInput | SortOrder
    firma_evidencia?: SortOrderInput | SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
    expediente?: ExpedienteOrderByWithRelationInput
    auditor?: UsuarioOrderByWithRelationInput
    evidencias?: EvidenciaOrderByRelationAggregateInput
    _relevance?: VisitaAuditoriaOrderByRelevanceInput
  }

  export type VisitaAuditoriaWhereUniqueInput = Prisma.AtLeast<{
    id_visita?: number
    client_sync_id?: string
    AND?: VisitaAuditoriaWhereInput | VisitaAuditoriaWhereInput[]
    OR?: VisitaAuditoriaWhereInput[]
    NOT?: VisitaAuditoriaWhereInput | VisitaAuditoriaWhereInput[]
    id_asignacion?: IntNullableFilter<"VisitaAuditoria"> | number | null
    id_expediente?: IntFilter<"VisitaAuditoria"> | number
    id_usuario_auditor?: StringFilter<"VisitaAuditoria"> | string
    fecha_hora_checkin?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_hora_checkout?: DateTimeNullableFilter<"VisitaAuditoria"> | Date | string | null
    latitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFilter<"VisitaAuditoria"> | boolean
    device_integrity_ok?: BoolFilter<"VisitaAuditoria"> | boolean
    device_id?: StringNullableFilter<"VisitaAuditoria"> | string | null
    server_received_at?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    resultado?: StringFilter<"VisitaAuditoria"> | string
    respuestas_cuestionario?: JsonFilter<"VisitaAuditoria">
    comentario_negocio?: StringNullableFilter<"VisitaAuditoria"> | string | null
    comentario_auditor?: StringNullableFilter<"VisitaAuditoria"> | string | null
    otros_clientes_domicilio?: JsonNullableFilter<"VisitaAuditoria">
    otros_ingresos?: JsonNullableFilter<"VisitaAuditoria">
    firma_evidencia?: StringNullableFilter<"VisitaAuditoria"> | string | null
    estado?: StringFilter<"VisitaAuditoria"> | string
    fecha_creacion?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_actualizar?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    expediente?: XOR<ExpedienteScalarRelationFilter, ExpedienteWhereInput>
    auditor?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    evidencias?: EvidenciaListRelationFilter
  }, "id_visita" | "client_sync_id">

  export type VisitaAuditoriaOrderByWithAggregationInput = {
    id_visita?: SortOrder
    client_sync_id?: SortOrderInput | SortOrder
    id_asignacion?: SortOrderInput | SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_hora_checkin?: SortOrder
    fecha_hora_checkout?: SortOrderInput | SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrderInput | SortOrder
    distancia_domicilio_m?: SortOrderInput | SortOrder
    mock_location?: SortOrder
    device_integrity_ok?: SortOrder
    device_id?: SortOrderInput | SortOrder
    server_received_at?: SortOrder
    resultado?: SortOrder
    respuestas_cuestionario?: SortOrder
    comentario_negocio?: SortOrderInput | SortOrder
    comentario_auditor?: SortOrderInput | SortOrder
    otros_clientes_domicilio?: SortOrderInput | SortOrder
    otros_ingresos?: SortOrderInput | SortOrder
    firma_evidencia?: SortOrderInput | SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
    _count?: VisitaAuditoriaCountOrderByAggregateInput
    _avg?: VisitaAuditoriaAvgOrderByAggregateInput
    _max?: VisitaAuditoriaMaxOrderByAggregateInput
    _min?: VisitaAuditoriaMinOrderByAggregateInput
    _sum?: VisitaAuditoriaSumOrderByAggregateInput
  }

  export type VisitaAuditoriaScalarWhereWithAggregatesInput = {
    AND?: VisitaAuditoriaScalarWhereWithAggregatesInput | VisitaAuditoriaScalarWhereWithAggregatesInput[]
    OR?: VisitaAuditoriaScalarWhereWithAggregatesInput[]
    NOT?: VisitaAuditoriaScalarWhereWithAggregatesInput | VisitaAuditoriaScalarWhereWithAggregatesInput[]
    id_visita?: IntWithAggregatesFilter<"VisitaAuditoria"> | number
    client_sync_id?: StringNullableWithAggregatesFilter<"VisitaAuditoria"> | string | null
    id_asignacion?: IntNullableWithAggregatesFilter<"VisitaAuditoria"> | number | null
    id_expediente?: IntWithAggregatesFilter<"VisitaAuditoria"> | number
    id_usuario_auditor?: StringWithAggregatesFilter<"VisitaAuditoria"> | string
    fecha_hora_checkin?: DateTimeWithAggregatesFilter<"VisitaAuditoria"> | Date | string
    fecha_hora_checkout?: DateTimeNullableWithAggregatesFilter<"VisitaAuditoria"> | Date | string | null
    latitud?: DecimalWithAggregatesFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalWithAggregatesFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableWithAggregatesFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: DecimalNullableWithAggregatesFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolWithAggregatesFilter<"VisitaAuditoria"> | boolean
    device_integrity_ok?: BoolWithAggregatesFilter<"VisitaAuditoria"> | boolean
    device_id?: StringNullableWithAggregatesFilter<"VisitaAuditoria"> | string | null
    server_received_at?: DateTimeWithAggregatesFilter<"VisitaAuditoria"> | Date | string
    resultado?: StringWithAggregatesFilter<"VisitaAuditoria"> | string
    respuestas_cuestionario?: JsonWithAggregatesFilter<"VisitaAuditoria">
    comentario_negocio?: StringNullableWithAggregatesFilter<"VisitaAuditoria"> | string | null
    comentario_auditor?: StringNullableWithAggregatesFilter<"VisitaAuditoria"> | string | null
    otros_clientes_domicilio?: JsonNullableWithAggregatesFilter<"VisitaAuditoria">
    otros_ingresos?: JsonNullableWithAggregatesFilter<"VisitaAuditoria">
    firma_evidencia?: StringNullableWithAggregatesFilter<"VisitaAuditoria"> | string | null
    estado?: StringWithAggregatesFilter<"VisitaAuditoria"> | string
    fecha_creacion?: DateTimeWithAggregatesFilter<"VisitaAuditoria"> | Date | string
    fecha_actualizar?: DateTimeWithAggregatesFilter<"VisitaAuditoria"> | Date | string
  }

  export type EvidenciaWhereInput = {
    AND?: EvidenciaWhereInput | EvidenciaWhereInput[]
    OR?: EvidenciaWhereInput[]
    NOT?: EvidenciaWhereInput | EvidenciaWhereInput[]
    id_evidencia?: StringFilter<"Evidencia"> | string
    id_visita?: IntFilter<"Evidencia"> | number
    tipo?: StringFilter<"Evidencia"> | string
    object_key?: StringFilter<"Evidencia"> | string
    hash_sha256?: StringFilter<"Evidencia"> | string
    latitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFilter<"Evidencia"> | Date | string
    fecha_creacion?: DateTimeFilter<"Evidencia"> | Date | string
    visita?: XOR<VisitaAuditoriaScalarRelationFilter, VisitaAuditoriaWhereInput>
  }

  export type EvidenciaOrderByWithRelationInput = {
    id_evidencia?: SortOrder
    id_visita?: SortOrder
    tipo?: SortOrder
    object_key?: SortOrder
    hash_sha256?: SortOrder
    latitud_captura?: SortOrderInput | SortOrder
    longitud_captura?: SortOrderInput | SortOrder
    capturado_en?: SortOrder
    fecha_creacion?: SortOrder
    visita?: VisitaAuditoriaOrderByWithRelationInput
    _relevance?: EvidenciaOrderByRelevanceInput
  }

  export type EvidenciaWhereUniqueInput = Prisma.AtLeast<{
    id_evidencia?: string
    hash_sha256?: string
    AND?: EvidenciaWhereInput | EvidenciaWhereInput[]
    OR?: EvidenciaWhereInput[]
    NOT?: EvidenciaWhereInput | EvidenciaWhereInput[]
    id_visita?: IntFilter<"Evidencia"> | number
    tipo?: StringFilter<"Evidencia"> | string
    object_key?: StringFilter<"Evidencia"> | string
    latitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFilter<"Evidencia"> | Date | string
    fecha_creacion?: DateTimeFilter<"Evidencia"> | Date | string
    visita?: XOR<VisitaAuditoriaScalarRelationFilter, VisitaAuditoriaWhereInput>
  }, "id_evidencia" | "hash_sha256">

  export type EvidenciaOrderByWithAggregationInput = {
    id_evidencia?: SortOrder
    id_visita?: SortOrder
    tipo?: SortOrder
    object_key?: SortOrder
    hash_sha256?: SortOrder
    latitud_captura?: SortOrderInput | SortOrder
    longitud_captura?: SortOrderInput | SortOrder
    capturado_en?: SortOrder
    fecha_creacion?: SortOrder
    _count?: EvidenciaCountOrderByAggregateInput
    _avg?: EvidenciaAvgOrderByAggregateInput
    _max?: EvidenciaMaxOrderByAggregateInput
    _min?: EvidenciaMinOrderByAggregateInput
    _sum?: EvidenciaSumOrderByAggregateInput
  }

  export type EvidenciaScalarWhereWithAggregatesInput = {
    AND?: EvidenciaScalarWhereWithAggregatesInput | EvidenciaScalarWhereWithAggregatesInput[]
    OR?: EvidenciaScalarWhereWithAggregatesInput[]
    NOT?: EvidenciaScalarWhereWithAggregatesInput | EvidenciaScalarWhereWithAggregatesInput[]
    id_evidencia?: StringWithAggregatesFilter<"Evidencia"> | string
    id_visita?: IntWithAggregatesFilter<"Evidencia"> | number
    tipo?: StringWithAggregatesFilter<"Evidencia"> | string
    object_key?: StringWithAggregatesFilter<"Evidencia"> | string
    hash_sha256?: StringWithAggregatesFilter<"Evidencia"> | string
    latitud_captura?: DecimalNullableWithAggregatesFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: DecimalNullableWithAggregatesFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeWithAggregatesFilter<"Evidencia"> | Date | string
    fecha_creacion?: DateTimeWithAggregatesFilter<"Evidencia"> | Date | string
  }

  export type AuditoriaSeguridadWhereInput = {
    AND?: AuditoriaSeguridadWhereInput | AuditoriaSeguridadWhereInput[]
    OR?: AuditoriaSeguridadWhereInput[]
    NOT?: AuditoriaSeguridadWhereInput | AuditoriaSeguridadWhereInput[]
    id_auditoria?: StringFilter<"AuditoriaSeguridad"> | string
    fecha?: DateTimeFilter<"AuditoriaSeguridad"> | Date | string
    request_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    actor_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    actor?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    rol?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    metodo?: StringFilter<"AuditoriaSeguridad"> | string
    ruta?: StringFilter<"AuditoriaSeguridad"> | string
    estado_http?: IntFilter<"AuditoriaSeguridad"> | number
    ip_address?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    ip_hash?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    user_agent?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    device_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    mock_location?: BoolNullableFilter<"AuditoriaSeguridad"> | boolean | null
  }

  export type AuditoriaSeguridadOrderByWithRelationInput = {
    id_auditoria?: SortOrder
    fecha?: SortOrder
    request_id?: SortOrderInput | SortOrder
    actor_id?: SortOrderInput | SortOrder
    actor?: SortOrderInput | SortOrder
    rol?: SortOrderInput | SortOrder
    metodo?: SortOrder
    ruta?: SortOrder
    estado_http?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    ip_hash?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    device_id?: SortOrderInput | SortOrder
    mock_location?: SortOrderInput | SortOrder
    _relevance?: AuditoriaSeguridadOrderByRelevanceInput
  }

  export type AuditoriaSeguridadWhereUniqueInput = Prisma.AtLeast<{
    id_auditoria?: string
    AND?: AuditoriaSeguridadWhereInput | AuditoriaSeguridadWhereInput[]
    OR?: AuditoriaSeguridadWhereInput[]
    NOT?: AuditoriaSeguridadWhereInput | AuditoriaSeguridadWhereInput[]
    fecha?: DateTimeFilter<"AuditoriaSeguridad"> | Date | string
    request_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    actor_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    actor?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    rol?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    metodo?: StringFilter<"AuditoriaSeguridad"> | string
    ruta?: StringFilter<"AuditoriaSeguridad"> | string
    estado_http?: IntFilter<"AuditoriaSeguridad"> | number
    ip_address?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    ip_hash?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    user_agent?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    device_id?: StringNullableFilter<"AuditoriaSeguridad"> | string | null
    mock_location?: BoolNullableFilter<"AuditoriaSeguridad"> | boolean | null
  }, "id_auditoria">

  export type AuditoriaSeguridadOrderByWithAggregationInput = {
    id_auditoria?: SortOrder
    fecha?: SortOrder
    request_id?: SortOrderInput | SortOrder
    actor_id?: SortOrderInput | SortOrder
    actor?: SortOrderInput | SortOrder
    rol?: SortOrderInput | SortOrder
    metodo?: SortOrder
    ruta?: SortOrder
    estado_http?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    ip_hash?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    device_id?: SortOrderInput | SortOrder
    mock_location?: SortOrderInput | SortOrder
    _count?: AuditoriaSeguridadCountOrderByAggregateInput
    _avg?: AuditoriaSeguridadAvgOrderByAggregateInput
    _max?: AuditoriaSeguridadMaxOrderByAggregateInput
    _min?: AuditoriaSeguridadMinOrderByAggregateInput
    _sum?: AuditoriaSeguridadSumOrderByAggregateInput
  }

  export type AuditoriaSeguridadScalarWhereWithAggregatesInput = {
    AND?: AuditoriaSeguridadScalarWhereWithAggregatesInput | AuditoriaSeguridadScalarWhereWithAggregatesInput[]
    OR?: AuditoriaSeguridadScalarWhereWithAggregatesInput[]
    NOT?: AuditoriaSeguridadScalarWhereWithAggregatesInput | AuditoriaSeguridadScalarWhereWithAggregatesInput[]
    id_auditoria?: StringWithAggregatesFilter<"AuditoriaSeguridad"> | string
    fecha?: DateTimeWithAggregatesFilter<"AuditoriaSeguridad"> | Date | string
    request_id?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    actor_id?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    actor?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    rol?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    metodo?: StringWithAggregatesFilter<"AuditoriaSeguridad"> | string
    ruta?: StringWithAggregatesFilter<"AuditoriaSeguridad"> | string
    estado_http?: IntWithAggregatesFilter<"AuditoriaSeguridad"> | number
    ip_address?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    ip_hash?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    user_agent?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    device_id?: StringNullableWithAggregatesFilter<"AuditoriaSeguridad"> | string | null
    mock_location?: BoolNullableWithAggregatesFilter<"AuditoriaSeguridad"> | boolean | null
  }

  export type ImportacionMasivaWhereInput = {
    AND?: ImportacionMasivaWhereInput | ImportacionMasivaWhereInput[]
    OR?: ImportacionMasivaWhereInput[]
    NOT?: ImportacionMasivaWhereInput | ImportacionMasivaWhereInput[]
    id_importacion?: StringFilter<"ImportacionMasiva"> | string
    tipo?: StringFilter<"ImportacionMasiva"> | string
    estado?: StringFilter<"ImportacionMasiva"> | string
    archivo?: StringFilter<"ImportacionMasiva"> | string
    ruta_temporal?: StringFilter<"ImportacionMasiva"> | string
    actor_id?: StringNullableFilter<"ImportacionMasiva"> | string | null
    total_filas?: IntFilter<"ImportacionMasiva"> | number
    procesadas?: IntFilter<"ImportacionMasiva"> | number
    insertadas?: IntFilter<"ImportacionMasiva"> | number
    actualizadas?: IntFilter<"ImportacionMasiva"> | number
    omitidas?: IntFilter<"ImportacionMasiva"> | number
    errores?: IntFilter<"ImportacionMasiva"> | number
    detalle_error?: JsonNullableFilter<"ImportacionMasiva">
    fecha_creacion?: DateTimeFilter<"ImportacionMasiva"> | Date | string
    fecha_inicio?: DateTimeNullableFilter<"ImportacionMasiva"> | Date | string | null
    fecha_fin?: DateTimeNullableFilter<"ImportacionMasiva"> | Date | string | null
  }

  export type ImportacionMasivaOrderByWithRelationInput = {
    id_importacion?: SortOrder
    tipo?: SortOrder
    estado?: SortOrder
    archivo?: SortOrder
    ruta_temporal?: SortOrder
    actor_id?: SortOrderInput | SortOrder
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
    detalle_error?: SortOrderInput | SortOrder
    fecha_creacion?: SortOrder
    fecha_inicio?: SortOrderInput | SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    _relevance?: ImportacionMasivaOrderByRelevanceInput
  }

  export type ImportacionMasivaWhereUniqueInput = Prisma.AtLeast<{
    id_importacion?: string
    AND?: ImportacionMasivaWhereInput | ImportacionMasivaWhereInput[]
    OR?: ImportacionMasivaWhereInput[]
    NOT?: ImportacionMasivaWhereInput | ImportacionMasivaWhereInput[]
    tipo?: StringFilter<"ImportacionMasiva"> | string
    estado?: StringFilter<"ImportacionMasiva"> | string
    archivo?: StringFilter<"ImportacionMasiva"> | string
    ruta_temporal?: StringFilter<"ImportacionMasiva"> | string
    actor_id?: StringNullableFilter<"ImportacionMasiva"> | string | null
    total_filas?: IntFilter<"ImportacionMasiva"> | number
    procesadas?: IntFilter<"ImportacionMasiva"> | number
    insertadas?: IntFilter<"ImportacionMasiva"> | number
    actualizadas?: IntFilter<"ImportacionMasiva"> | number
    omitidas?: IntFilter<"ImportacionMasiva"> | number
    errores?: IntFilter<"ImportacionMasiva"> | number
    detalle_error?: JsonNullableFilter<"ImportacionMasiva">
    fecha_creacion?: DateTimeFilter<"ImportacionMasiva"> | Date | string
    fecha_inicio?: DateTimeNullableFilter<"ImportacionMasiva"> | Date | string | null
    fecha_fin?: DateTimeNullableFilter<"ImportacionMasiva"> | Date | string | null
  }, "id_importacion">

  export type ImportacionMasivaOrderByWithAggregationInput = {
    id_importacion?: SortOrder
    tipo?: SortOrder
    estado?: SortOrder
    archivo?: SortOrder
    ruta_temporal?: SortOrder
    actor_id?: SortOrderInput | SortOrder
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
    detalle_error?: SortOrderInput | SortOrder
    fecha_creacion?: SortOrder
    fecha_inicio?: SortOrderInput | SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    _count?: ImportacionMasivaCountOrderByAggregateInput
    _avg?: ImportacionMasivaAvgOrderByAggregateInput
    _max?: ImportacionMasivaMaxOrderByAggregateInput
    _min?: ImportacionMasivaMinOrderByAggregateInput
    _sum?: ImportacionMasivaSumOrderByAggregateInput
  }

  export type ImportacionMasivaScalarWhereWithAggregatesInput = {
    AND?: ImportacionMasivaScalarWhereWithAggregatesInput | ImportacionMasivaScalarWhereWithAggregatesInput[]
    OR?: ImportacionMasivaScalarWhereWithAggregatesInput[]
    NOT?: ImportacionMasivaScalarWhereWithAggregatesInput | ImportacionMasivaScalarWhereWithAggregatesInput[]
    id_importacion?: StringWithAggregatesFilter<"ImportacionMasiva"> | string
    tipo?: StringWithAggregatesFilter<"ImportacionMasiva"> | string
    estado?: StringWithAggregatesFilter<"ImportacionMasiva"> | string
    archivo?: StringWithAggregatesFilter<"ImportacionMasiva"> | string
    ruta_temporal?: StringWithAggregatesFilter<"ImportacionMasiva"> | string
    actor_id?: StringNullableWithAggregatesFilter<"ImportacionMasiva"> | string | null
    total_filas?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    procesadas?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    insertadas?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    actualizadas?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    omitidas?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    errores?: IntWithAggregatesFilter<"ImportacionMasiva"> | number
    detalle_error?: JsonNullableWithAggregatesFilter<"ImportacionMasiva">
    fecha_creacion?: DateTimeWithAggregatesFilter<"ImportacionMasiva"> | Date | string
    fecha_inicio?: DateTimeNullableWithAggregatesFilter<"ImportacionMasiva"> | Date | string | null
    fecha_fin?: DateTimeNullableWithAggregatesFilter<"ImportacionMasiva"> | Date | string | null
  }

  export type UsuarioCreateInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoUncheckedCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
  }

  export type UsuarioUpdateManyMutationInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type UsuarioUncheckedUpdateManyInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type TrackingUbicacionCreateInput = {
    id_tracking?: bigint | number
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
    usuario: UsuarioCreateNestedOneWithoutTrackingsInput
  }

  export type TrackingUbicacionUncheckedCreateInput = {
    id_tracking?: bigint | number
    id_usuario: string
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
  }

  export type TrackingUbicacionUpdateInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneRequiredWithoutTrackingsNestedInput
  }

  export type TrackingUbicacionUncheckedUpdateInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    id_usuario?: StringFieldUpdateOperationsInput | string
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackingUbicacionCreateManyInput = {
    id_tracking?: bigint | number
    id_usuario: string
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
  }

  export type TrackingUbicacionUpdateManyMutationInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackingUbicacionUncheckedUpdateManyInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    id_usuario?: StringFieldUpdateOperationsInput | string
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispositivoAutorizadoCreateInput = {
    id_dispositivo?: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
    usuario: UsuarioCreateNestedOneWithoutDispositivosInput
  }

  export type DispositivoAutorizadoUncheckedCreateInput = {
    id_dispositivo?: string
    id_usuario: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
  }

  export type DispositivoAutorizadoUpdateInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usuario?: UsuarioUpdateOneRequiredWithoutDispositivosNestedInput
  }

  export type DispositivoAutorizadoUncheckedUpdateInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    id_usuario?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispositivoAutorizadoCreateManyInput = {
    id_dispositivo?: string
    id_usuario: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
  }

  export type DispositivoAutorizadoUpdateManyMutationInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispositivoAutorizadoUncheckedUpdateManyInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    id_usuario?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExpedienteCreateInput = {
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutExpedienteInput
    visitas?: VisitaAuditoriaCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteUncheckedCreateInput = {
    id_expediente?: number
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteUpdateInput = {
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutExpedienteNestedInput
    visitas?: VisitaAuditoriaUpdateManyWithoutExpedienteNestedInput
  }

  export type ExpedienteUncheckedUpdateInput = {
    id_expediente?: IntFieldUpdateOperationsInput | number
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput
  }

  export type ExpedienteCreateManyInput = {
    id_expediente?: number
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
  }

  export type ExpedienteUpdateManyMutationInput = {
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpedienteUncheckedUpdateManyInput = {
    id_expediente?: IntFieldUpdateOperationsInput | number
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionAuditoriaCreateInput = {
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
    expediente: ExpedienteCreateNestedOneWithoutAsignacionesInput
    auditor: UsuarioCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionAuditoriaUncheckedCreateInput = {
    id_asignacion?: number
    id_expediente: number
    id_usuario_auditor: string
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type AsignacionAuditoriaUpdateInput = {
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    expediente?: ExpedienteUpdateOneRequiredWithoutAsignacionesNestedInput
    auditor?: UsuarioUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type AsignacionAuditoriaUncheckedUpdateInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_expediente?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type AsignacionAuditoriaCreateManyInput = {
    id_asignacion?: number
    id_expediente: number
    id_usuario_auditor: string
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type AsignacionAuditoriaUpdateManyMutationInput = {
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type AsignacionAuditoriaUncheckedUpdateManyInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_expediente?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type VisitaAuditoriaCreateInput = {
    client_sync_id?: string | null
    id_asignacion?: number | null
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    expediente: ExpedienteCreateNestedOneWithoutVisitasInput
    auditor: UsuarioCreateNestedOneWithoutVisitasInput
    evidencias?: EvidenciaCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaUncheckedCreateInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_expediente: number
    id_usuario_auditor: string
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    evidencias?: EvidenciaUncheckedCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaUpdateInput = {
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    expediente?: ExpedienteUpdateOneRequiredWithoutVisitasNestedInput
    auditor?: UsuarioUpdateOneRequiredWithoutVisitasNestedInput
    evidencias?: EvidenciaUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_expediente?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    evidencias?: EvidenciaUncheckedUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaCreateManyInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_expediente: number
    id_usuario_auditor: string
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
  }

  export type VisitaAuditoriaUpdateManyMutationInput = {
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VisitaAuditoriaUncheckedUpdateManyInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_expediente?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaCreateInput = {
    id_evidencia?: string
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
    visita: VisitaAuditoriaCreateNestedOneWithoutEvidenciasInput
  }

  export type EvidenciaUncheckedCreateInput = {
    id_evidencia?: string
    id_visita: number
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
  }

  export type EvidenciaUpdateInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    visita?: VisitaAuditoriaUpdateOneRequiredWithoutEvidenciasNestedInput
  }

  export type EvidenciaUncheckedUpdateInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    id_visita?: IntFieldUpdateOperationsInput | number
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaCreateManyInput = {
    id_evidencia?: string
    id_visita: number
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
  }

  export type EvidenciaUpdateManyMutationInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaUncheckedUpdateManyInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    id_visita?: IntFieldUpdateOperationsInput | number
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaSeguridadCreateInput = {
    id_auditoria?: string
    fecha?: Date | string
    request_id?: string | null
    actor_id?: string | null
    actor?: string | null
    rol?: string | null
    metodo: string
    ruta: string
    estado_http: number
    ip_address?: string | null
    ip_hash?: string | null
    user_agent?: string | null
    device_id?: string | null
    mock_location?: boolean | null
  }

  export type AuditoriaSeguridadUncheckedCreateInput = {
    id_auditoria?: string
    fecha?: Date | string
    request_id?: string | null
    actor_id?: string | null
    actor?: string | null
    rol?: string | null
    metodo: string
    ruta: string
    estado_http: number
    ip_address?: string | null
    ip_hash?: string | null
    user_agent?: string | null
    device_id?: string | null
    mock_location?: boolean | null
  }

  export type AuditoriaSeguridadUpdateInput = {
    id_auditoria?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    request_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor?: NullableStringFieldUpdateOperationsInput | string | null
    rol?: NullableStringFieldUpdateOperationsInput | string | null
    metodo?: StringFieldUpdateOperationsInput | string
    ruta?: StringFieldUpdateOperationsInput | string
    estado_http?: IntFieldUpdateOperationsInput | number
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    ip_hash?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    mock_location?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type AuditoriaSeguridadUncheckedUpdateInput = {
    id_auditoria?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    request_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor?: NullableStringFieldUpdateOperationsInput | string | null
    rol?: NullableStringFieldUpdateOperationsInput | string | null
    metodo?: StringFieldUpdateOperationsInput | string
    ruta?: StringFieldUpdateOperationsInput | string
    estado_http?: IntFieldUpdateOperationsInput | number
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    ip_hash?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    mock_location?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type AuditoriaSeguridadCreateManyInput = {
    id_auditoria?: string
    fecha?: Date | string
    request_id?: string | null
    actor_id?: string | null
    actor?: string | null
    rol?: string | null
    metodo: string
    ruta: string
    estado_http: number
    ip_address?: string | null
    ip_hash?: string | null
    user_agent?: string | null
    device_id?: string | null
    mock_location?: boolean | null
  }

  export type AuditoriaSeguridadUpdateManyMutationInput = {
    id_auditoria?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    request_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor?: NullableStringFieldUpdateOperationsInput | string | null
    rol?: NullableStringFieldUpdateOperationsInput | string | null
    metodo?: StringFieldUpdateOperationsInput | string
    ruta?: StringFieldUpdateOperationsInput | string
    estado_http?: IntFieldUpdateOperationsInput | number
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    ip_hash?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    mock_location?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type AuditoriaSeguridadUncheckedUpdateManyInput = {
    id_auditoria?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    request_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    actor?: NullableStringFieldUpdateOperationsInput | string | null
    rol?: NullableStringFieldUpdateOperationsInput | string | null
    metodo?: StringFieldUpdateOperationsInput | string
    ruta?: StringFieldUpdateOperationsInput | string
    estado_http?: IntFieldUpdateOperationsInput | number
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    ip_hash?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    mock_location?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type ImportacionMasivaCreateInput = {
    id_importacion?: string
    tipo: string
    estado?: string
    archivo: string
    ruta_temporal: string
    actor_id?: string | null
    total_filas?: number
    procesadas?: number
    insertadas?: number
    actualizadas?: number
    omitidas?: number
    errores?: number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: Date | string
    fecha_inicio?: Date | string | null
    fecha_fin?: Date | string | null
  }

  export type ImportacionMasivaUncheckedCreateInput = {
    id_importacion?: string
    tipo: string
    estado?: string
    archivo: string
    ruta_temporal: string
    actor_id?: string | null
    total_filas?: number
    procesadas?: number
    insertadas?: number
    actualizadas?: number
    omitidas?: number
    errores?: number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: Date | string
    fecha_inicio?: Date | string | null
    fecha_fin?: Date | string | null
  }

  export type ImportacionMasivaUpdateInput = {
    id_importacion?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    archivo?: StringFieldUpdateOperationsInput | string
    ruta_temporal?: StringFieldUpdateOperationsInput | string
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    total_filas?: IntFieldUpdateOperationsInput | number
    procesadas?: IntFieldUpdateOperationsInput | number
    insertadas?: IntFieldUpdateOperationsInput | number
    actualizadas?: IntFieldUpdateOperationsInput | number
    omitidas?: IntFieldUpdateOperationsInput | number
    errores?: IntFieldUpdateOperationsInput | number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportacionMasivaUncheckedUpdateInput = {
    id_importacion?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    archivo?: StringFieldUpdateOperationsInput | string
    ruta_temporal?: StringFieldUpdateOperationsInput | string
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    total_filas?: IntFieldUpdateOperationsInput | number
    procesadas?: IntFieldUpdateOperationsInput | number
    insertadas?: IntFieldUpdateOperationsInput | number
    actualizadas?: IntFieldUpdateOperationsInput | number
    omitidas?: IntFieldUpdateOperationsInput | number
    errores?: IntFieldUpdateOperationsInput | number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportacionMasivaCreateManyInput = {
    id_importacion?: string
    tipo: string
    estado?: string
    archivo: string
    ruta_temporal: string
    actor_id?: string | null
    total_filas?: number
    procesadas?: number
    insertadas?: number
    actualizadas?: number
    omitidas?: number
    errores?: number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: Date | string
    fecha_inicio?: Date | string | null
    fecha_fin?: Date | string | null
  }

  export type ImportacionMasivaUpdateManyMutationInput = {
    id_importacion?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    archivo?: StringFieldUpdateOperationsInput | string
    ruta_temporal?: StringFieldUpdateOperationsInput | string
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    total_filas?: IntFieldUpdateOperationsInput | number
    procesadas?: IntFieldUpdateOperationsInput | number
    insertadas?: IntFieldUpdateOperationsInput | number
    actualizadas?: IntFieldUpdateOperationsInput | number
    omitidas?: IntFieldUpdateOperationsInput | number
    errores?: IntFieldUpdateOperationsInput | number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportacionMasivaUncheckedUpdateManyInput = {
    id_importacion?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    archivo?: StringFieldUpdateOperationsInput | string
    ruta_temporal?: StringFieldUpdateOperationsInput | string
    actor_id?: NullableStringFieldUpdateOperationsInput | string | null
    total_filas?: IntFieldUpdateOperationsInput | number
    procesadas?: IntFieldUpdateOperationsInput | number
    insertadas?: IntFieldUpdateOperationsInput | number
    actualizadas?: IntFieldUpdateOperationsInput | number
    omitidas?: IntFieldUpdateOperationsInput | number
    errores?: IntFieldUpdateOperationsInput | number
    detalle_error?: NullableJsonNullValueInput | InputJsonValue
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type AsignacionAuditoriaListRelationFilter = {
    every?: AsignacionAuditoriaWhereInput
    some?: AsignacionAuditoriaWhereInput
    none?: AsignacionAuditoriaWhereInput
  }

  export type VisitaAuditoriaListRelationFilter = {
    every?: VisitaAuditoriaWhereInput
    some?: VisitaAuditoriaWhereInput
    none?: VisitaAuditoriaWhereInput
  }

  export type DispositivoAutorizadoListRelationFilter = {
    every?: DispositivoAutorizadoWhereInput
    some?: DispositivoAutorizadoWhereInput
    none?: DispositivoAutorizadoWhereInput
  }

  export type TrackingUbicacionListRelationFilter = {
    every?: TrackingUbicacionWhereInput
    some?: TrackingUbicacionWhereInput
    none?: TrackingUbicacionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AsignacionAuditoriaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VisitaAuditoriaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DispositivoAutorizadoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrackingUbicacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioOrderByRelevanceInput = {
    fields: UsuarioOrderByRelevanceFieldEnum | UsuarioOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type UsuarioCountOrderByAggregateInput = {
    id_usuario?: SortOrder
    username?: SortOrder
    nombres?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    sede?: SortOrder
    departamento?: SortOrder
    password_hash?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    mfa_habilitado?: SortOrder
    mfa_requerido?: SortOrder
    mfa_exento?: SortOrder
    mfa_secreto?: SortOrder
    mfa_ultimo_uso?: SortOrder
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    bloqueado_hasta?: SortOrder
    ultimo_acceso?: SortOrder
    password_cambio?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
  }

  export type UsuarioAvgOrderByAggregateInput = {
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    id_usuario?: SortOrder
    username?: SortOrder
    nombres?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    sede?: SortOrder
    departamento?: SortOrder
    password_hash?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    mfa_habilitado?: SortOrder
    mfa_requerido?: SortOrder
    mfa_exento?: SortOrder
    mfa_secreto?: SortOrder
    mfa_ultimo_uso?: SortOrder
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    bloqueado_hasta?: SortOrder
    ultimo_acceso?: SortOrder
    password_cambio?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    id_usuario?: SortOrder
    username?: SortOrder
    nombres?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    sede?: SortOrder
    departamento?: SortOrder
    password_hash?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    mfa_habilitado?: SortOrder
    mfa_requerido?: SortOrder
    mfa_exento?: SortOrder
    mfa_secreto?: SortOrder
    mfa_ultimo_uso?: SortOrder
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    bloqueado_hasta?: SortOrder
    ultimo_acceso?: SortOrder
    password_cambio?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
  }

  export type UsuarioSumOrderByAggregateInput = {
    token_version?: SortOrder
    intentos_fallidos?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type UsuarioScalarRelationFilter = {
    is?: UsuarioWhereInput
    isNot?: UsuarioWhereInput
  }

  export type TrackingUbicacionOrderByRelevanceInput = {
    fields: TrackingUbicacionOrderByRelevanceFieldEnum | TrackingUbicacionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TrackingUbicacionCountOrderByAggregateInput = {
    id_tracking?: SortOrder
    id_usuario?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    registrado_en?: SortOrder
  }

  export type TrackingUbicacionAvgOrderByAggregateInput = {
    id_tracking?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
  }

  export type TrackingUbicacionMaxOrderByAggregateInput = {
    id_tracking?: SortOrder
    id_usuario?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    registrado_en?: SortOrder
  }

  export type TrackingUbicacionMinOrderByAggregateInput = {
    id_tracking?: SortOrder
    id_usuario?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    registrado_en?: SortOrder
  }

  export type TrackingUbicacionSumOrderByAggregateInput = {
    id_tracking?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DispositivoAutorizadoOrderByRelevanceInput = {
    fields: DispositivoAutorizadoOrderByRelevanceFieldEnum | DispositivoAutorizadoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DispositivoAutorizadoId_usuarioDevice_idCompoundUniqueInput = {
    id_usuario: string
    device_id: string
  }

  export type DispositivoAutorizadoCountOrderByAggregateInput = {
    id_dispositivo?: SortOrder
    id_usuario?: SortOrder
    device_id?: SortOrder
    nombre_dispositivo?: SortOrder
    activo?: SortOrder
    primer_uso?: SortOrder
    ultimo_uso?: SortOrder
  }

  export type DispositivoAutorizadoMaxOrderByAggregateInput = {
    id_dispositivo?: SortOrder
    id_usuario?: SortOrder
    device_id?: SortOrder
    nombre_dispositivo?: SortOrder
    activo?: SortOrder
    primer_uso?: SortOrder
    ultimo_uso?: SortOrder
  }

  export type DispositivoAutorizadoMinOrderByAggregateInput = {
    id_dispositivo?: SortOrder
    id_usuario?: SortOrder
    device_id?: SortOrder
    nombre_dispositivo?: SortOrder
    activo?: SortOrder
    primer_uso?: SortOrder
    ultimo_uso?: SortOrder
  }

  export type EnumTipoCreditoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoCredito | EnumTipoCreditoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoCredito[]
    notIn?: $Enums.TipoCredito[]
    not?: NestedEnumTipoCreditoFilter<$PrismaModel> | $Enums.TipoCredito
  }

  export type EnumTipoDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumento | EnumTipoDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoDocumento[]
    notIn?: $Enums.TipoDocumento[]
    not?: NestedEnumTipoDocumentoFilter<$PrismaModel> | $Enums.TipoDocumento
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ExpedienteOrderByRelevanceInput = {
    fields: ExpedienteOrderByRelevanceFieldEnum | ExpedienteOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ExpedienteCountOrderByAggregateInput = {
    id_expediente?: SortOrder
    codigo_expediente?: SortOrder
    tipo_credito?: SortOrder
    oficina?: SortOrder
    tipo_documento_cliente?: SortOrder
    numero_documento_cliente?: SortOrder
    nombres_cliente?: SortOrder
    telefono_cliente?: SortOrder
    direccion_domicilio?: SortOrder
    distrito?: SortOrder
    provincia?: SortOrder
    departamento?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    asesor_responsable?: SortOrder
    monto_desembolso?: SortOrder
    moneda?: SortOrder
    datos_cliente?: SortOrder
    datos_negocio?: SortOrder
    datos_credito?: SortOrder
    evaluacion_financiera?: SortOrder
    endeudamiento?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type ExpedienteAvgOrderByAggregateInput = {
    id_expediente?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    monto_desembolso?: SortOrder
  }

  export type ExpedienteMaxOrderByAggregateInput = {
    id_expediente?: SortOrder
    codigo_expediente?: SortOrder
    tipo_credito?: SortOrder
    oficina?: SortOrder
    tipo_documento_cliente?: SortOrder
    numero_documento_cliente?: SortOrder
    nombres_cliente?: SortOrder
    telefono_cliente?: SortOrder
    direccion_domicilio?: SortOrder
    distrito?: SortOrder
    provincia?: SortOrder
    departamento?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    asesor_responsable?: SortOrder
    monto_desembolso?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type ExpedienteMinOrderByAggregateInput = {
    id_expediente?: SortOrder
    codigo_expediente?: SortOrder
    tipo_credito?: SortOrder
    oficina?: SortOrder
    tipo_documento_cliente?: SortOrder
    numero_documento_cliente?: SortOrder
    nombres_cliente?: SortOrder
    telefono_cliente?: SortOrder
    direccion_domicilio?: SortOrder
    distrito?: SortOrder
    provincia?: SortOrder
    departamento?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    asesor_responsable?: SortOrder
    monto_desembolso?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type ExpedienteSumOrderByAggregateInput = {
    id_expediente?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    monto_desembolso?: SortOrder
  }

  export type EnumTipoCreditoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoCredito | EnumTipoCreditoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoCredito[]
    notIn?: $Enums.TipoCredito[]
    not?: NestedEnumTipoCreditoWithAggregatesFilter<$PrismaModel> | $Enums.TipoCredito
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoCreditoFilter<$PrismaModel>
    _max?: NestedEnumTipoCreditoFilter<$PrismaModel>
  }

  export type EnumTipoDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumento | EnumTipoDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoDocumento[]
    notIn?: $Enums.TipoDocumento[]
    not?: NestedEnumTipoDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.TipoDocumento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoDocumentoFilter<$PrismaModel>
    _max?: NestedEnumTipoDocumentoFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type ExpedienteScalarRelationFilter = {
    is?: ExpedienteWhereInput
    isNot?: ExpedienteWhereInput
  }

  export type AsignacionAuditoriaOrderByRelevanceInput = {
    fields: AsignacionAuditoriaOrderByRelevanceFieldEnum | AsignacionAuditoriaOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AsignacionAuditoriaCountOrderByAggregateInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_asignacion?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    prioridad?: SortOrder
  }

  export type AsignacionAuditoriaAvgOrderByAggregateInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
  }

  export type AsignacionAuditoriaMaxOrderByAggregateInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_asignacion?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    prioridad?: SortOrder
  }

  export type AsignacionAuditoriaMinOrderByAggregateInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_asignacion?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    prioridad?: SortOrder
  }

  export type AsignacionAuditoriaSumOrderByAggregateInput = {
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EvidenciaListRelationFilter = {
    every?: EvidenciaWhereInput
    some?: EvidenciaWhereInput
    none?: EvidenciaWhereInput
  }

  export type EvidenciaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VisitaAuditoriaOrderByRelevanceInput = {
    fields: VisitaAuditoriaOrderByRelevanceFieldEnum | VisitaAuditoriaOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type VisitaAuditoriaCountOrderByAggregateInput = {
    id_visita?: SortOrder
    client_sync_id?: SortOrder
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_hora_checkin?: SortOrder
    fecha_hora_checkout?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    distancia_domicilio_m?: SortOrder
    mock_location?: SortOrder
    device_integrity_ok?: SortOrder
    device_id?: SortOrder
    server_received_at?: SortOrder
    resultado?: SortOrder
    respuestas_cuestionario?: SortOrder
    comentario_negocio?: SortOrder
    comentario_auditor?: SortOrder
    otros_clientes_domicilio?: SortOrder
    otros_ingresos?: SortOrder
    firma_evidencia?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type VisitaAuditoriaAvgOrderByAggregateInput = {
    id_visita?: SortOrder
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    distancia_domicilio_m?: SortOrder
  }

  export type VisitaAuditoriaMaxOrderByAggregateInput = {
    id_visita?: SortOrder
    client_sync_id?: SortOrder
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_hora_checkin?: SortOrder
    fecha_hora_checkout?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    distancia_domicilio_m?: SortOrder
    mock_location?: SortOrder
    device_integrity_ok?: SortOrder
    device_id?: SortOrder
    server_received_at?: SortOrder
    resultado?: SortOrder
    comentario_negocio?: SortOrder
    comentario_auditor?: SortOrder
    firma_evidencia?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type VisitaAuditoriaMinOrderByAggregateInput = {
    id_visita?: SortOrder
    client_sync_id?: SortOrder
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    id_usuario_auditor?: SortOrder
    fecha_hora_checkin?: SortOrder
    fecha_hora_checkout?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    distancia_domicilio_m?: SortOrder
    mock_location?: SortOrder
    device_integrity_ok?: SortOrder
    device_id?: SortOrder
    server_received_at?: SortOrder
    resultado?: SortOrder
    comentario_negocio?: SortOrder
    comentario_auditor?: SortOrder
    firma_evidencia?: SortOrder
    estado?: SortOrder
    fecha_creacion?: SortOrder
    fecha_actualizar?: SortOrder
  }

  export type VisitaAuditoriaSumOrderByAggregateInput = {
    id_visita?: SortOrder
    id_asignacion?: SortOrder
    id_expediente?: SortOrder
    latitud?: SortOrder
    longitud?: SortOrder
    precision_metros?: SortOrder
    distancia_domicilio_m?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type VisitaAuditoriaScalarRelationFilter = {
    is?: VisitaAuditoriaWhereInput
    isNot?: VisitaAuditoriaWhereInput
  }

  export type EvidenciaOrderByRelevanceInput = {
    fields: EvidenciaOrderByRelevanceFieldEnum | EvidenciaOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type EvidenciaCountOrderByAggregateInput = {
    id_evidencia?: SortOrder
    id_visita?: SortOrder
    tipo?: SortOrder
    object_key?: SortOrder
    hash_sha256?: SortOrder
    latitud_captura?: SortOrder
    longitud_captura?: SortOrder
    capturado_en?: SortOrder
    fecha_creacion?: SortOrder
  }

  export type EvidenciaAvgOrderByAggregateInput = {
    id_visita?: SortOrder
    latitud_captura?: SortOrder
    longitud_captura?: SortOrder
  }

  export type EvidenciaMaxOrderByAggregateInput = {
    id_evidencia?: SortOrder
    id_visita?: SortOrder
    tipo?: SortOrder
    object_key?: SortOrder
    hash_sha256?: SortOrder
    latitud_captura?: SortOrder
    longitud_captura?: SortOrder
    capturado_en?: SortOrder
    fecha_creacion?: SortOrder
  }

  export type EvidenciaMinOrderByAggregateInput = {
    id_evidencia?: SortOrder
    id_visita?: SortOrder
    tipo?: SortOrder
    object_key?: SortOrder
    hash_sha256?: SortOrder
    latitud_captura?: SortOrder
    longitud_captura?: SortOrder
    capturado_en?: SortOrder
    fecha_creacion?: SortOrder
  }

  export type EvidenciaSumOrderByAggregateInput = {
    id_visita?: SortOrder
    latitud_captura?: SortOrder
    longitud_captura?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type AuditoriaSeguridadOrderByRelevanceInput = {
    fields: AuditoriaSeguridadOrderByRelevanceFieldEnum | AuditoriaSeguridadOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AuditoriaSeguridadCountOrderByAggregateInput = {
    id_auditoria?: SortOrder
    fecha?: SortOrder
    request_id?: SortOrder
    actor_id?: SortOrder
    actor?: SortOrder
    rol?: SortOrder
    metodo?: SortOrder
    ruta?: SortOrder
    estado_http?: SortOrder
    ip_address?: SortOrder
    ip_hash?: SortOrder
    user_agent?: SortOrder
    device_id?: SortOrder
    mock_location?: SortOrder
  }

  export type AuditoriaSeguridadAvgOrderByAggregateInput = {
    estado_http?: SortOrder
  }

  export type AuditoriaSeguridadMaxOrderByAggregateInput = {
    id_auditoria?: SortOrder
    fecha?: SortOrder
    request_id?: SortOrder
    actor_id?: SortOrder
    actor?: SortOrder
    rol?: SortOrder
    metodo?: SortOrder
    ruta?: SortOrder
    estado_http?: SortOrder
    ip_address?: SortOrder
    ip_hash?: SortOrder
    user_agent?: SortOrder
    device_id?: SortOrder
    mock_location?: SortOrder
  }

  export type AuditoriaSeguridadMinOrderByAggregateInput = {
    id_auditoria?: SortOrder
    fecha?: SortOrder
    request_id?: SortOrder
    actor_id?: SortOrder
    actor?: SortOrder
    rol?: SortOrder
    metodo?: SortOrder
    ruta?: SortOrder
    estado_http?: SortOrder
    ip_address?: SortOrder
    ip_hash?: SortOrder
    user_agent?: SortOrder
    device_id?: SortOrder
    mock_location?: SortOrder
  }

  export type AuditoriaSeguridadSumOrderByAggregateInput = {
    estado_http?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type ImportacionMasivaOrderByRelevanceInput = {
    fields: ImportacionMasivaOrderByRelevanceFieldEnum | ImportacionMasivaOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ImportacionMasivaCountOrderByAggregateInput = {
    id_importacion?: SortOrder
    tipo?: SortOrder
    estado?: SortOrder
    archivo?: SortOrder
    ruta_temporal?: SortOrder
    actor_id?: SortOrder
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
    detalle_error?: SortOrder
    fecha_creacion?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
  }

  export type ImportacionMasivaAvgOrderByAggregateInput = {
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
  }

  export type ImportacionMasivaMaxOrderByAggregateInput = {
    id_importacion?: SortOrder
    tipo?: SortOrder
    estado?: SortOrder
    archivo?: SortOrder
    ruta_temporal?: SortOrder
    actor_id?: SortOrder
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
    fecha_creacion?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
  }

  export type ImportacionMasivaMinOrderByAggregateInput = {
    id_importacion?: SortOrder
    tipo?: SortOrder
    estado?: SortOrder
    archivo?: SortOrder
    ruta_temporal?: SortOrder
    actor_id?: SortOrder
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
    fecha_creacion?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
  }

  export type ImportacionMasivaSumOrderByAggregateInput = {
    total_filas?: SortOrder
    procesadas?: SortOrder
    insertadas?: SortOrder
    actualizadas?: SortOrder
    omitidas?: SortOrder
    errores?: SortOrder
  }

  export type AsignacionAuditoriaCreateNestedManyWithoutAuditorInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput> | AsignacionAuditoriaCreateWithoutAuditorInput[] | AsignacionAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutAuditorInput | AsignacionAuditoriaCreateOrConnectWithoutAuditorInput[]
    createMany?: AsignacionAuditoriaCreateManyAuditorInputEnvelope
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
  }

  export type VisitaAuditoriaCreateNestedManyWithoutAuditorInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput> | VisitaAuditoriaCreateWithoutAuditorInput[] | VisitaAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutAuditorInput | VisitaAuditoriaCreateOrConnectWithoutAuditorInput[]
    createMany?: VisitaAuditoriaCreateManyAuditorInputEnvelope
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
  }

  export type DispositivoAutorizadoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput> | DispositivoAutorizadoCreateWithoutUsuarioInput[] | DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput | DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput[]
    createMany?: DispositivoAutorizadoCreateManyUsuarioInputEnvelope
    connect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
  }

  export type TrackingUbicacionCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput> | TrackingUbicacionCreateWithoutUsuarioInput[] | TrackingUbicacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: TrackingUbicacionCreateOrConnectWithoutUsuarioInput | TrackingUbicacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: TrackingUbicacionCreateManyUsuarioInputEnvelope
    connect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
  }

  export type AsignacionAuditoriaUncheckedCreateNestedManyWithoutAuditorInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput> | AsignacionAuditoriaCreateWithoutAuditorInput[] | AsignacionAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutAuditorInput | AsignacionAuditoriaCreateOrConnectWithoutAuditorInput[]
    createMany?: AsignacionAuditoriaCreateManyAuditorInputEnvelope
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
  }

  export type VisitaAuditoriaUncheckedCreateNestedManyWithoutAuditorInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput> | VisitaAuditoriaCreateWithoutAuditorInput[] | VisitaAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutAuditorInput | VisitaAuditoriaCreateOrConnectWithoutAuditorInput[]
    createMany?: VisitaAuditoriaCreateManyAuditorInputEnvelope
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
  }

  export type DispositivoAutorizadoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput> | DispositivoAutorizadoCreateWithoutUsuarioInput[] | DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput | DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput[]
    createMany?: DispositivoAutorizadoCreateManyUsuarioInputEnvelope
    connect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
  }

  export type TrackingUbicacionUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput> | TrackingUbicacionCreateWithoutUsuarioInput[] | TrackingUbicacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: TrackingUbicacionCreateOrConnectWithoutUsuarioInput | TrackingUbicacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: TrackingUbicacionCreateManyUsuarioInputEnvelope
    connect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type AsignacionAuditoriaUpdateManyWithoutAuditorNestedInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput> | AsignacionAuditoriaCreateWithoutAuditorInput[] | AsignacionAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutAuditorInput | AsignacionAuditoriaCreateOrConnectWithoutAuditorInput[]
    upsert?: AsignacionAuditoriaUpsertWithWhereUniqueWithoutAuditorInput | AsignacionAuditoriaUpsertWithWhereUniqueWithoutAuditorInput[]
    createMany?: AsignacionAuditoriaCreateManyAuditorInputEnvelope
    set?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    disconnect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    delete?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    update?: AsignacionAuditoriaUpdateWithWhereUniqueWithoutAuditorInput | AsignacionAuditoriaUpdateWithWhereUniqueWithoutAuditorInput[]
    updateMany?: AsignacionAuditoriaUpdateManyWithWhereWithoutAuditorInput | AsignacionAuditoriaUpdateManyWithWhereWithoutAuditorInput[]
    deleteMany?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
  }

  export type VisitaAuditoriaUpdateManyWithoutAuditorNestedInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput> | VisitaAuditoriaCreateWithoutAuditorInput[] | VisitaAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutAuditorInput | VisitaAuditoriaCreateOrConnectWithoutAuditorInput[]
    upsert?: VisitaAuditoriaUpsertWithWhereUniqueWithoutAuditorInput | VisitaAuditoriaUpsertWithWhereUniqueWithoutAuditorInput[]
    createMany?: VisitaAuditoriaCreateManyAuditorInputEnvelope
    set?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    disconnect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    delete?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    update?: VisitaAuditoriaUpdateWithWhereUniqueWithoutAuditorInput | VisitaAuditoriaUpdateWithWhereUniqueWithoutAuditorInput[]
    updateMany?: VisitaAuditoriaUpdateManyWithWhereWithoutAuditorInput | VisitaAuditoriaUpdateManyWithWhereWithoutAuditorInput[]
    deleteMany?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
  }

  export type DispositivoAutorizadoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput> | DispositivoAutorizadoCreateWithoutUsuarioInput[] | DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput | DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput[]
    upsert?: DispositivoAutorizadoUpsertWithWhereUniqueWithoutUsuarioInput | DispositivoAutorizadoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: DispositivoAutorizadoCreateManyUsuarioInputEnvelope
    set?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    disconnect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    delete?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    connect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    update?: DispositivoAutorizadoUpdateWithWhereUniqueWithoutUsuarioInput | DispositivoAutorizadoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: DispositivoAutorizadoUpdateManyWithWhereWithoutUsuarioInput | DispositivoAutorizadoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: DispositivoAutorizadoScalarWhereInput | DispositivoAutorizadoScalarWhereInput[]
  }

  export type TrackingUbicacionUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput> | TrackingUbicacionCreateWithoutUsuarioInput[] | TrackingUbicacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: TrackingUbicacionCreateOrConnectWithoutUsuarioInput | TrackingUbicacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: TrackingUbicacionUpsertWithWhereUniqueWithoutUsuarioInput | TrackingUbicacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: TrackingUbicacionCreateManyUsuarioInputEnvelope
    set?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    disconnect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    delete?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    connect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    update?: TrackingUbicacionUpdateWithWhereUniqueWithoutUsuarioInput | TrackingUbicacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: TrackingUbicacionUpdateManyWithWhereWithoutUsuarioInput | TrackingUbicacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: TrackingUbicacionScalarWhereInput | TrackingUbicacionScalarWhereInput[]
  }

  export type AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput> | AsignacionAuditoriaCreateWithoutAuditorInput[] | AsignacionAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutAuditorInput | AsignacionAuditoriaCreateOrConnectWithoutAuditorInput[]
    upsert?: AsignacionAuditoriaUpsertWithWhereUniqueWithoutAuditorInput | AsignacionAuditoriaUpsertWithWhereUniqueWithoutAuditorInput[]
    createMany?: AsignacionAuditoriaCreateManyAuditorInputEnvelope
    set?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    disconnect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    delete?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    update?: AsignacionAuditoriaUpdateWithWhereUniqueWithoutAuditorInput | AsignacionAuditoriaUpdateWithWhereUniqueWithoutAuditorInput[]
    updateMany?: AsignacionAuditoriaUpdateManyWithWhereWithoutAuditorInput | AsignacionAuditoriaUpdateManyWithWhereWithoutAuditorInput[]
    deleteMany?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
  }

  export type VisitaAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput> | VisitaAuditoriaCreateWithoutAuditorInput[] | VisitaAuditoriaUncheckedCreateWithoutAuditorInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutAuditorInput | VisitaAuditoriaCreateOrConnectWithoutAuditorInput[]
    upsert?: VisitaAuditoriaUpsertWithWhereUniqueWithoutAuditorInput | VisitaAuditoriaUpsertWithWhereUniqueWithoutAuditorInput[]
    createMany?: VisitaAuditoriaCreateManyAuditorInputEnvelope
    set?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    disconnect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    delete?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    update?: VisitaAuditoriaUpdateWithWhereUniqueWithoutAuditorInput | VisitaAuditoriaUpdateWithWhereUniqueWithoutAuditorInput[]
    updateMany?: VisitaAuditoriaUpdateManyWithWhereWithoutAuditorInput | VisitaAuditoriaUpdateManyWithWhereWithoutAuditorInput[]
    deleteMany?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
  }

  export type DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput> | DispositivoAutorizadoCreateWithoutUsuarioInput[] | DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput | DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput[]
    upsert?: DispositivoAutorizadoUpsertWithWhereUniqueWithoutUsuarioInput | DispositivoAutorizadoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: DispositivoAutorizadoCreateManyUsuarioInputEnvelope
    set?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    disconnect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    delete?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    connect?: DispositivoAutorizadoWhereUniqueInput | DispositivoAutorizadoWhereUniqueInput[]
    update?: DispositivoAutorizadoUpdateWithWhereUniqueWithoutUsuarioInput | DispositivoAutorizadoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: DispositivoAutorizadoUpdateManyWithWhereWithoutUsuarioInput | DispositivoAutorizadoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: DispositivoAutorizadoScalarWhereInput | DispositivoAutorizadoScalarWhereInput[]
  }

  export type TrackingUbicacionUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput> | TrackingUbicacionCreateWithoutUsuarioInput[] | TrackingUbicacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: TrackingUbicacionCreateOrConnectWithoutUsuarioInput | TrackingUbicacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: TrackingUbicacionUpsertWithWhereUniqueWithoutUsuarioInput | TrackingUbicacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: TrackingUbicacionCreateManyUsuarioInputEnvelope
    set?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    disconnect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    delete?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    connect?: TrackingUbicacionWhereUniqueInput | TrackingUbicacionWhereUniqueInput[]
    update?: TrackingUbicacionUpdateWithWhereUniqueWithoutUsuarioInput | TrackingUbicacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: TrackingUbicacionUpdateManyWithWhereWithoutUsuarioInput | TrackingUbicacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: TrackingUbicacionScalarWhereInput | TrackingUbicacionScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutTrackingsInput = {
    create?: XOR<UsuarioCreateWithoutTrackingsInput, UsuarioUncheckedCreateWithoutTrackingsInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutTrackingsInput
    connect?: UsuarioWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UsuarioUpdateOneRequiredWithoutTrackingsNestedInput = {
    create?: XOR<UsuarioCreateWithoutTrackingsInput, UsuarioUncheckedCreateWithoutTrackingsInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutTrackingsInput
    upsert?: UsuarioUpsertWithoutTrackingsInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutTrackingsInput, UsuarioUpdateWithoutTrackingsInput>, UsuarioUncheckedUpdateWithoutTrackingsInput>
  }

  export type UsuarioCreateNestedOneWithoutDispositivosInput = {
    create?: XOR<UsuarioCreateWithoutDispositivosInput, UsuarioUncheckedCreateWithoutDispositivosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutDispositivosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type UsuarioUpdateOneRequiredWithoutDispositivosNestedInput = {
    create?: XOR<UsuarioCreateWithoutDispositivosInput, UsuarioUncheckedCreateWithoutDispositivosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutDispositivosInput
    upsert?: UsuarioUpsertWithoutDispositivosInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutDispositivosInput, UsuarioUpdateWithoutDispositivosInput>, UsuarioUncheckedUpdateWithoutDispositivosInput>
  }

  export type AsignacionAuditoriaCreateNestedManyWithoutExpedienteInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput> | AsignacionAuditoriaCreateWithoutExpedienteInput[] | AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput | AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput[]
    createMany?: AsignacionAuditoriaCreateManyExpedienteInputEnvelope
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
  }

  export type VisitaAuditoriaCreateNestedManyWithoutExpedienteInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput> | VisitaAuditoriaCreateWithoutExpedienteInput[] | VisitaAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutExpedienteInput | VisitaAuditoriaCreateOrConnectWithoutExpedienteInput[]
    createMany?: VisitaAuditoriaCreateManyExpedienteInputEnvelope
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
  }

  export type AsignacionAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput> | AsignacionAuditoriaCreateWithoutExpedienteInput[] | AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput | AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput[]
    createMany?: AsignacionAuditoriaCreateManyExpedienteInputEnvelope
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
  }

  export type VisitaAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput> | VisitaAuditoriaCreateWithoutExpedienteInput[] | VisitaAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutExpedienteInput | VisitaAuditoriaCreateOrConnectWithoutExpedienteInput[]
    createMany?: VisitaAuditoriaCreateManyExpedienteInputEnvelope
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
  }

  export type EnumTipoCreditoFieldUpdateOperationsInput = {
    set?: $Enums.TipoCredito
  }

  export type EnumTipoDocumentoFieldUpdateOperationsInput = {
    set?: $Enums.TipoDocumento
  }

  export type AsignacionAuditoriaUpdateManyWithoutExpedienteNestedInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput> | AsignacionAuditoriaCreateWithoutExpedienteInput[] | AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput | AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput[]
    upsert?: AsignacionAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput | AsignacionAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput[]
    createMany?: AsignacionAuditoriaCreateManyExpedienteInputEnvelope
    set?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    disconnect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    delete?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    update?: AsignacionAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput | AsignacionAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput[]
    updateMany?: AsignacionAuditoriaUpdateManyWithWhereWithoutExpedienteInput | AsignacionAuditoriaUpdateManyWithWhereWithoutExpedienteInput[]
    deleteMany?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
  }

  export type VisitaAuditoriaUpdateManyWithoutExpedienteNestedInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput> | VisitaAuditoriaCreateWithoutExpedienteInput[] | VisitaAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutExpedienteInput | VisitaAuditoriaCreateOrConnectWithoutExpedienteInput[]
    upsert?: VisitaAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput | VisitaAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput[]
    createMany?: VisitaAuditoriaCreateManyExpedienteInputEnvelope
    set?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    disconnect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    delete?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    update?: VisitaAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput | VisitaAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput[]
    updateMany?: VisitaAuditoriaUpdateManyWithWhereWithoutExpedienteInput | VisitaAuditoriaUpdateManyWithWhereWithoutExpedienteInput[]
    deleteMany?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
  }

  export type AsignacionAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput = {
    create?: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput> | AsignacionAuditoriaCreateWithoutExpedienteInput[] | AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput | AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput[]
    upsert?: AsignacionAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput | AsignacionAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput[]
    createMany?: AsignacionAuditoriaCreateManyExpedienteInputEnvelope
    set?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    disconnect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    delete?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    connect?: AsignacionAuditoriaWhereUniqueInput | AsignacionAuditoriaWhereUniqueInput[]
    update?: AsignacionAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput | AsignacionAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput[]
    updateMany?: AsignacionAuditoriaUpdateManyWithWhereWithoutExpedienteInput | AsignacionAuditoriaUpdateManyWithWhereWithoutExpedienteInput[]
    deleteMany?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
  }

  export type VisitaAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput> | VisitaAuditoriaCreateWithoutExpedienteInput[] | VisitaAuditoriaUncheckedCreateWithoutExpedienteInput[]
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutExpedienteInput | VisitaAuditoriaCreateOrConnectWithoutExpedienteInput[]
    upsert?: VisitaAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput | VisitaAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput[]
    createMany?: VisitaAuditoriaCreateManyExpedienteInputEnvelope
    set?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    disconnect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    delete?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    connect?: VisitaAuditoriaWhereUniqueInput | VisitaAuditoriaWhereUniqueInput[]
    update?: VisitaAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput | VisitaAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput[]
    updateMany?: VisitaAuditoriaUpdateManyWithWhereWithoutExpedienteInput | VisitaAuditoriaUpdateManyWithWhereWithoutExpedienteInput[]
    deleteMany?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
  }

  export type ExpedienteCreateNestedOneWithoutAsignacionesInput = {
    create?: XOR<ExpedienteCreateWithoutAsignacionesInput, ExpedienteUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: ExpedienteCreateOrConnectWithoutAsignacionesInput
    connect?: ExpedienteWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutAsignacionesInput = {
    create?: XOR<UsuarioCreateWithoutAsignacionesInput, UsuarioUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAsignacionesInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ExpedienteUpdateOneRequiredWithoutAsignacionesNestedInput = {
    create?: XOR<ExpedienteCreateWithoutAsignacionesInput, ExpedienteUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: ExpedienteCreateOrConnectWithoutAsignacionesInput
    upsert?: ExpedienteUpsertWithoutAsignacionesInput
    connect?: ExpedienteWhereUniqueInput
    update?: XOR<XOR<ExpedienteUpdateToOneWithWhereWithoutAsignacionesInput, ExpedienteUpdateWithoutAsignacionesInput>, ExpedienteUncheckedUpdateWithoutAsignacionesInput>
  }

  export type UsuarioUpdateOneRequiredWithoutAsignacionesNestedInput = {
    create?: XOR<UsuarioCreateWithoutAsignacionesInput, UsuarioUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAsignacionesInput
    upsert?: UsuarioUpsertWithoutAsignacionesInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutAsignacionesInput, UsuarioUpdateWithoutAsignacionesInput>, UsuarioUncheckedUpdateWithoutAsignacionesInput>
  }

  export type ExpedienteCreateNestedOneWithoutVisitasInput = {
    create?: XOR<ExpedienteCreateWithoutVisitasInput, ExpedienteUncheckedCreateWithoutVisitasInput>
    connectOrCreate?: ExpedienteCreateOrConnectWithoutVisitasInput
    connect?: ExpedienteWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutVisitasInput = {
    create?: XOR<UsuarioCreateWithoutVisitasInput, UsuarioUncheckedCreateWithoutVisitasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutVisitasInput
    connect?: UsuarioWhereUniqueInput
  }

  export type EvidenciaCreateNestedManyWithoutVisitaInput = {
    create?: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput> | EvidenciaCreateWithoutVisitaInput[] | EvidenciaUncheckedCreateWithoutVisitaInput[]
    connectOrCreate?: EvidenciaCreateOrConnectWithoutVisitaInput | EvidenciaCreateOrConnectWithoutVisitaInput[]
    createMany?: EvidenciaCreateManyVisitaInputEnvelope
    connect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
  }

  export type EvidenciaUncheckedCreateNestedManyWithoutVisitaInput = {
    create?: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput> | EvidenciaCreateWithoutVisitaInput[] | EvidenciaUncheckedCreateWithoutVisitaInput[]
    connectOrCreate?: EvidenciaCreateOrConnectWithoutVisitaInput | EvidenciaCreateOrConnectWithoutVisitaInput[]
    createMany?: EvidenciaCreateManyVisitaInputEnvelope
    connect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ExpedienteUpdateOneRequiredWithoutVisitasNestedInput = {
    create?: XOR<ExpedienteCreateWithoutVisitasInput, ExpedienteUncheckedCreateWithoutVisitasInput>
    connectOrCreate?: ExpedienteCreateOrConnectWithoutVisitasInput
    upsert?: ExpedienteUpsertWithoutVisitasInput
    connect?: ExpedienteWhereUniqueInput
    update?: XOR<XOR<ExpedienteUpdateToOneWithWhereWithoutVisitasInput, ExpedienteUpdateWithoutVisitasInput>, ExpedienteUncheckedUpdateWithoutVisitasInput>
  }

  export type UsuarioUpdateOneRequiredWithoutVisitasNestedInput = {
    create?: XOR<UsuarioCreateWithoutVisitasInput, UsuarioUncheckedCreateWithoutVisitasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutVisitasInput
    upsert?: UsuarioUpsertWithoutVisitasInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutVisitasInput, UsuarioUpdateWithoutVisitasInput>, UsuarioUncheckedUpdateWithoutVisitasInput>
  }

  export type EvidenciaUpdateManyWithoutVisitaNestedInput = {
    create?: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput> | EvidenciaCreateWithoutVisitaInput[] | EvidenciaUncheckedCreateWithoutVisitaInput[]
    connectOrCreate?: EvidenciaCreateOrConnectWithoutVisitaInput | EvidenciaCreateOrConnectWithoutVisitaInput[]
    upsert?: EvidenciaUpsertWithWhereUniqueWithoutVisitaInput | EvidenciaUpsertWithWhereUniqueWithoutVisitaInput[]
    createMany?: EvidenciaCreateManyVisitaInputEnvelope
    set?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    disconnect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    delete?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    connect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    update?: EvidenciaUpdateWithWhereUniqueWithoutVisitaInput | EvidenciaUpdateWithWhereUniqueWithoutVisitaInput[]
    updateMany?: EvidenciaUpdateManyWithWhereWithoutVisitaInput | EvidenciaUpdateManyWithWhereWithoutVisitaInput[]
    deleteMany?: EvidenciaScalarWhereInput | EvidenciaScalarWhereInput[]
  }

  export type EvidenciaUncheckedUpdateManyWithoutVisitaNestedInput = {
    create?: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput> | EvidenciaCreateWithoutVisitaInput[] | EvidenciaUncheckedCreateWithoutVisitaInput[]
    connectOrCreate?: EvidenciaCreateOrConnectWithoutVisitaInput | EvidenciaCreateOrConnectWithoutVisitaInput[]
    upsert?: EvidenciaUpsertWithWhereUniqueWithoutVisitaInput | EvidenciaUpsertWithWhereUniqueWithoutVisitaInput[]
    createMany?: EvidenciaCreateManyVisitaInputEnvelope
    set?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    disconnect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    delete?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    connect?: EvidenciaWhereUniqueInput | EvidenciaWhereUniqueInput[]
    update?: EvidenciaUpdateWithWhereUniqueWithoutVisitaInput | EvidenciaUpdateWithWhereUniqueWithoutVisitaInput[]
    updateMany?: EvidenciaUpdateManyWithWhereWithoutVisitaInput | EvidenciaUpdateManyWithWhereWithoutVisitaInput[]
    deleteMany?: EvidenciaScalarWhereInput | EvidenciaScalarWhereInput[]
  }

  export type VisitaAuditoriaCreateNestedOneWithoutEvidenciasInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutEvidenciasInput, VisitaAuditoriaUncheckedCreateWithoutEvidenciasInput>
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutEvidenciasInput
    connect?: VisitaAuditoriaWhereUniqueInput
  }

  export type VisitaAuditoriaUpdateOneRequiredWithoutEvidenciasNestedInput = {
    create?: XOR<VisitaAuditoriaCreateWithoutEvidenciasInput, VisitaAuditoriaUncheckedCreateWithoutEvidenciasInput>
    connectOrCreate?: VisitaAuditoriaCreateOrConnectWithoutEvidenciasInput
    upsert?: VisitaAuditoriaUpsertWithoutEvidenciasInput
    connect?: VisitaAuditoriaWhereUniqueInput
    update?: XOR<XOR<VisitaAuditoriaUpdateToOneWithWhereWithoutEvidenciasInput, VisitaAuditoriaUpdateWithoutEvidenciasInput>, VisitaAuditoriaUncheckedUpdateWithoutEvidenciasInput>
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumTipoCreditoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoCredito | EnumTipoCreditoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoCredito[]
    notIn?: $Enums.TipoCredito[]
    not?: NestedEnumTipoCreditoFilter<$PrismaModel> | $Enums.TipoCredito
  }

  export type NestedEnumTipoDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumento | EnumTipoDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoDocumento[]
    notIn?: $Enums.TipoDocumento[]
    not?: NestedEnumTipoDocumentoFilter<$PrismaModel> | $Enums.TipoDocumento
  }

  export type NestedEnumTipoCreditoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoCredito | EnumTipoCreditoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoCredito[]
    notIn?: $Enums.TipoCredito[]
    not?: NestedEnumTipoCreditoWithAggregatesFilter<$PrismaModel> | $Enums.TipoCredito
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoCreditoFilter<$PrismaModel>
    _max?: NestedEnumTipoCreditoFilter<$PrismaModel>
  }

  export type NestedEnumTipoDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumento | EnumTipoDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoDocumento[]
    notIn?: $Enums.TipoDocumento[]
    not?: NestedEnumTipoDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.TipoDocumento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoDocumentoFilter<$PrismaModel>
    _max?: NestedEnumTipoDocumentoFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type AsignacionAuditoriaCreateWithoutAuditorInput = {
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
    expediente: ExpedienteCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionAuditoriaUncheckedCreateWithoutAuditorInput = {
    id_asignacion?: number
    id_expediente: number
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type AsignacionAuditoriaCreateOrConnectWithoutAuditorInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    create: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput>
  }

  export type AsignacionAuditoriaCreateManyAuditorInputEnvelope = {
    data: AsignacionAuditoriaCreateManyAuditorInput | AsignacionAuditoriaCreateManyAuditorInput[]
    skipDuplicates?: boolean
  }

  export type VisitaAuditoriaCreateWithoutAuditorInput = {
    client_sync_id?: string | null
    id_asignacion?: number | null
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    expediente: ExpedienteCreateNestedOneWithoutVisitasInput
    evidencias?: EvidenciaCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaUncheckedCreateWithoutAuditorInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_expediente: number
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    evidencias?: EvidenciaUncheckedCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaCreateOrConnectWithoutAuditorInput = {
    where: VisitaAuditoriaWhereUniqueInput
    create: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput>
  }

  export type VisitaAuditoriaCreateManyAuditorInputEnvelope = {
    data: VisitaAuditoriaCreateManyAuditorInput | VisitaAuditoriaCreateManyAuditorInput[]
    skipDuplicates?: boolean
  }

  export type DispositivoAutorizadoCreateWithoutUsuarioInput = {
    id_dispositivo?: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
  }

  export type DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput = {
    id_dispositivo?: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
  }

  export type DispositivoAutorizadoCreateOrConnectWithoutUsuarioInput = {
    where: DispositivoAutorizadoWhereUniqueInput
    create: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput>
  }

  export type DispositivoAutorizadoCreateManyUsuarioInputEnvelope = {
    data: DispositivoAutorizadoCreateManyUsuarioInput | DispositivoAutorizadoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type TrackingUbicacionCreateWithoutUsuarioInput = {
    id_tracking?: bigint | number
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
  }

  export type TrackingUbicacionUncheckedCreateWithoutUsuarioInput = {
    id_tracking?: bigint | number
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
  }

  export type TrackingUbicacionCreateOrConnectWithoutUsuarioInput = {
    where: TrackingUbicacionWhereUniqueInput
    create: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput>
  }

  export type TrackingUbicacionCreateManyUsuarioInputEnvelope = {
    data: TrackingUbicacionCreateManyUsuarioInput | TrackingUbicacionCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type AsignacionAuditoriaUpsertWithWhereUniqueWithoutAuditorInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    update: XOR<AsignacionAuditoriaUpdateWithoutAuditorInput, AsignacionAuditoriaUncheckedUpdateWithoutAuditorInput>
    create: XOR<AsignacionAuditoriaCreateWithoutAuditorInput, AsignacionAuditoriaUncheckedCreateWithoutAuditorInput>
  }

  export type AsignacionAuditoriaUpdateWithWhereUniqueWithoutAuditorInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    data: XOR<AsignacionAuditoriaUpdateWithoutAuditorInput, AsignacionAuditoriaUncheckedUpdateWithoutAuditorInput>
  }

  export type AsignacionAuditoriaUpdateManyWithWhereWithoutAuditorInput = {
    where: AsignacionAuditoriaScalarWhereInput
    data: XOR<AsignacionAuditoriaUpdateManyMutationInput, AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorInput>
  }

  export type AsignacionAuditoriaScalarWhereInput = {
    AND?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
    OR?: AsignacionAuditoriaScalarWhereInput[]
    NOT?: AsignacionAuditoriaScalarWhereInput | AsignacionAuditoriaScalarWhereInput[]
    id_asignacion?: IntFilter<"AsignacionAuditoria"> | number
    id_expediente?: IntFilter<"AsignacionAuditoria"> | number
    id_usuario_auditor?: StringFilter<"AsignacionAuditoria"> | string
    fecha_asignacion?: DateTimeFilter<"AsignacionAuditoria"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionAuditoria"> | Date | string | null
    estado?: StringFilter<"AsignacionAuditoria"> | string
    prioridad?: StringFilter<"AsignacionAuditoria"> | string
  }

  export type VisitaAuditoriaUpsertWithWhereUniqueWithoutAuditorInput = {
    where: VisitaAuditoriaWhereUniqueInput
    update: XOR<VisitaAuditoriaUpdateWithoutAuditorInput, VisitaAuditoriaUncheckedUpdateWithoutAuditorInput>
    create: XOR<VisitaAuditoriaCreateWithoutAuditorInput, VisitaAuditoriaUncheckedCreateWithoutAuditorInput>
  }

  export type VisitaAuditoriaUpdateWithWhereUniqueWithoutAuditorInput = {
    where: VisitaAuditoriaWhereUniqueInput
    data: XOR<VisitaAuditoriaUpdateWithoutAuditorInput, VisitaAuditoriaUncheckedUpdateWithoutAuditorInput>
  }

  export type VisitaAuditoriaUpdateManyWithWhereWithoutAuditorInput = {
    where: VisitaAuditoriaScalarWhereInput
    data: XOR<VisitaAuditoriaUpdateManyMutationInput, VisitaAuditoriaUncheckedUpdateManyWithoutAuditorInput>
  }

  export type VisitaAuditoriaScalarWhereInput = {
    AND?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
    OR?: VisitaAuditoriaScalarWhereInput[]
    NOT?: VisitaAuditoriaScalarWhereInput | VisitaAuditoriaScalarWhereInput[]
    id_visita?: IntFilter<"VisitaAuditoria"> | number
    client_sync_id?: StringNullableFilter<"VisitaAuditoria"> | string | null
    id_asignacion?: IntNullableFilter<"VisitaAuditoria"> | number | null
    id_expediente?: IntFilter<"VisitaAuditoria"> | number
    id_usuario_auditor?: StringFilter<"VisitaAuditoria"> | string
    fecha_hora_checkin?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_hora_checkout?: DateTimeNullableFilter<"VisitaAuditoria"> | Date | string | null
    latitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: DecimalNullableFilter<"VisitaAuditoria"> | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFilter<"VisitaAuditoria"> | boolean
    device_integrity_ok?: BoolFilter<"VisitaAuditoria"> | boolean
    device_id?: StringNullableFilter<"VisitaAuditoria"> | string | null
    server_received_at?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    resultado?: StringFilter<"VisitaAuditoria"> | string
    respuestas_cuestionario?: JsonFilter<"VisitaAuditoria">
    comentario_negocio?: StringNullableFilter<"VisitaAuditoria"> | string | null
    comentario_auditor?: StringNullableFilter<"VisitaAuditoria"> | string | null
    otros_clientes_domicilio?: JsonNullableFilter<"VisitaAuditoria">
    otros_ingresos?: JsonNullableFilter<"VisitaAuditoria">
    firma_evidencia?: StringNullableFilter<"VisitaAuditoria"> | string | null
    estado?: StringFilter<"VisitaAuditoria"> | string
    fecha_creacion?: DateTimeFilter<"VisitaAuditoria"> | Date | string
    fecha_actualizar?: DateTimeFilter<"VisitaAuditoria"> | Date | string
  }

  export type DispositivoAutorizadoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: DispositivoAutorizadoWhereUniqueInput
    update: XOR<DispositivoAutorizadoUpdateWithoutUsuarioInput, DispositivoAutorizadoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<DispositivoAutorizadoCreateWithoutUsuarioInput, DispositivoAutorizadoUncheckedCreateWithoutUsuarioInput>
  }

  export type DispositivoAutorizadoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: DispositivoAutorizadoWhereUniqueInput
    data: XOR<DispositivoAutorizadoUpdateWithoutUsuarioInput, DispositivoAutorizadoUncheckedUpdateWithoutUsuarioInput>
  }

  export type DispositivoAutorizadoUpdateManyWithWhereWithoutUsuarioInput = {
    where: DispositivoAutorizadoScalarWhereInput
    data: XOR<DispositivoAutorizadoUpdateManyMutationInput, DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type DispositivoAutorizadoScalarWhereInput = {
    AND?: DispositivoAutorizadoScalarWhereInput | DispositivoAutorizadoScalarWhereInput[]
    OR?: DispositivoAutorizadoScalarWhereInput[]
    NOT?: DispositivoAutorizadoScalarWhereInput | DispositivoAutorizadoScalarWhereInput[]
    id_dispositivo?: StringFilter<"DispositivoAutorizado"> | string
    id_usuario?: StringFilter<"DispositivoAutorizado"> | string
    device_id?: StringFilter<"DispositivoAutorizado"> | string
    nombre_dispositivo?: StringNullableFilter<"DispositivoAutorizado"> | string | null
    activo?: BoolFilter<"DispositivoAutorizado"> | boolean
    primer_uso?: DateTimeFilter<"DispositivoAutorizado"> | Date | string
    ultimo_uso?: DateTimeNullableFilter<"DispositivoAutorizado"> | Date | string | null
  }

  export type TrackingUbicacionUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: TrackingUbicacionWhereUniqueInput
    update: XOR<TrackingUbicacionUpdateWithoutUsuarioInput, TrackingUbicacionUncheckedUpdateWithoutUsuarioInput>
    create: XOR<TrackingUbicacionCreateWithoutUsuarioInput, TrackingUbicacionUncheckedCreateWithoutUsuarioInput>
  }

  export type TrackingUbicacionUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: TrackingUbicacionWhereUniqueInput
    data: XOR<TrackingUbicacionUpdateWithoutUsuarioInput, TrackingUbicacionUncheckedUpdateWithoutUsuarioInput>
  }

  export type TrackingUbicacionUpdateManyWithWhereWithoutUsuarioInput = {
    where: TrackingUbicacionScalarWhereInput
    data: XOR<TrackingUbicacionUpdateManyMutationInput, TrackingUbicacionUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type TrackingUbicacionScalarWhereInput = {
    AND?: TrackingUbicacionScalarWhereInput | TrackingUbicacionScalarWhereInput[]
    OR?: TrackingUbicacionScalarWhereInput[]
    NOT?: TrackingUbicacionScalarWhereInput | TrackingUbicacionScalarWhereInput[]
    id_tracking?: BigIntFilter<"TrackingUbicacion"> | bigint | number
    id_usuario?: StringFilter<"TrackingUbicacion"> | string
    latitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string
    precision_metros?: DecimalNullableFilter<"TrackingUbicacion"> | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFilter<"TrackingUbicacion"> | Date | string
  }

  export type UsuarioCreateWithoutTrackingsInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutTrackingsInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutTrackingsInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutTrackingsInput, UsuarioUncheckedCreateWithoutTrackingsInput>
  }

  export type UsuarioUpsertWithoutTrackingsInput = {
    update: XOR<UsuarioUpdateWithoutTrackingsInput, UsuarioUncheckedUpdateWithoutTrackingsInput>
    create: XOR<UsuarioCreateWithoutTrackingsInput, UsuarioUncheckedCreateWithoutTrackingsInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutTrackingsInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutTrackingsInput, UsuarioUncheckedUpdateWithoutTrackingsInput>
  }

  export type UsuarioUpdateWithoutTrackingsInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutTrackingsInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateWithoutDispositivosInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaCreateNestedManyWithoutAuditorInput
    trackings?: TrackingUbicacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutDispositivosInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    trackings?: TrackingUbicacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutDispositivosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutDispositivosInput, UsuarioUncheckedCreateWithoutDispositivosInput>
  }

  export type UsuarioUpsertWithoutDispositivosInput = {
    update: XOR<UsuarioUpdateWithoutDispositivosInput, UsuarioUncheckedUpdateWithoutDispositivosInput>
    create: XOR<UsuarioCreateWithoutDispositivosInput, UsuarioUncheckedCreateWithoutDispositivosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutDispositivosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutDispositivosInput, UsuarioUncheckedUpdateWithoutDispositivosInput>
  }

  export type UsuarioUpdateWithoutDispositivosInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUpdateManyWithoutAuditorNestedInput
    trackings?: TrackingUbicacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutDispositivosInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    trackings?: TrackingUbicacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type AsignacionAuditoriaCreateWithoutExpedienteInput = {
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
    auditor: UsuarioCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput = {
    id_asignacion?: number
    id_usuario_auditor: string
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type AsignacionAuditoriaCreateOrConnectWithoutExpedienteInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    create: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput>
  }

  export type AsignacionAuditoriaCreateManyExpedienteInputEnvelope = {
    data: AsignacionAuditoriaCreateManyExpedienteInput | AsignacionAuditoriaCreateManyExpedienteInput[]
    skipDuplicates?: boolean
  }

  export type VisitaAuditoriaCreateWithoutExpedienteInput = {
    client_sync_id?: string | null
    id_asignacion?: number | null
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    auditor: UsuarioCreateNestedOneWithoutVisitasInput
    evidencias?: EvidenciaCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaUncheckedCreateWithoutExpedienteInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_usuario_auditor: string
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    evidencias?: EvidenciaUncheckedCreateNestedManyWithoutVisitaInput
  }

  export type VisitaAuditoriaCreateOrConnectWithoutExpedienteInput = {
    where: VisitaAuditoriaWhereUniqueInput
    create: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput>
  }

  export type VisitaAuditoriaCreateManyExpedienteInputEnvelope = {
    data: VisitaAuditoriaCreateManyExpedienteInput | VisitaAuditoriaCreateManyExpedienteInput[]
    skipDuplicates?: boolean
  }

  export type AsignacionAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    update: XOR<AsignacionAuditoriaUpdateWithoutExpedienteInput, AsignacionAuditoriaUncheckedUpdateWithoutExpedienteInput>
    create: XOR<AsignacionAuditoriaCreateWithoutExpedienteInput, AsignacionAuditoriaUncheckedCreateWithoutExpedienteInput>
  }

  export type AsignacionAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput = {
    where: AsignacionAuditoriaWhereUniqueInput
    data: XOR<AsignacionAuditoriaUpdateWithoutExpedienteInput, AsignacionAuditoriaUncheckedUpdateWithoutExpedienteInput>
  }

  export type AsignacionAuditoriaUpdateManyWithWhereWithoutExpedienteInput = {
    where: AsignacionAuditoriaScalarWhereInput
    data: XOR<AsignacionAuditoriaUpdateManyMutationInput, AsignacionAuditoriaUncheckedUpdateManyWithoutExpedienteInput>
  }

  export type VisitaAuditoriaUpsertWithWhereUniqueWithoutExpedienteInput = {
    where: VisitaAuditoriaWhereUniqueInput
    update: XOR<VisitaAuditoriaUpdateWithoutExpedienteInput, VisitaAuditoriaUncheckedUpdateWithoutExpedienteInput>
    create: XOR<VisitaAuditoriaCreateWithoutExpedienteInput, VisitaAuditoriaUncheckedCreateWithoutExpedienteInput>
  }

  export type VisitaAuditoriaUpdateWithWhereUniqueWithoutExpedienteInput = {
    where: VisitaAuditoriaWhereUniqueInput
    data: XOR<VisitaAuditoriaUpdateWithoutExpedienteInput, VisitaAuditoriaUncheckedUpdateWithoutExpedienteInput>
  }

  export type VisitaAuditoriaUpdateManyWithWhereWithoutExpedienteInput = {
    where: VisitaAuditoriaScalarWhereInput
    data: XOR<VisitaAuditoriaUpdateManyMutationInput, VisitaAuditoriaUncheckedUpdateManyWithoutExpedienteInput>
  }

  export type ExpedienteCreateWithoutAsignacionesInput = {
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    visitas?: VisitaAuditoriaCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteUncheckedCreateWithoutAsignacionesInput = {
    id_expediente?: number
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteCreateOrConnectWithoutAsignacionesInput = {
    where: ExpedienteWhereUniqueInput
    create: XOR<ExpedienteCreateWithoutAsignacionesInput, ExpedienteUncheckedCreateWithoutAsignacionesInput>
  }

  export type UsuarioCreateWithoutAsignacionesInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    visitas?: VisitaAuditoriaCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutAsignacionesInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    visitas?: VisitaAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoUncheckedCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutAsignacionesInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutAsignacionesInput, UsuarioUncheckedCreateWithoutAsignacionesInput>
  }

  export type ExpedienteUpsertWithoutAsignacionesInput = {
    update: XOR<ExpedienteUpdateWithoutAsignacionesInput, ExpedienteUncheckedUpdateWithoutAsignacionesInput>
    create: XOR<ExpedienteCreateWithoutAsignacionesInput, ExpedienteUncheckedCreateWithoutAsignacionesInput>
    where?: ExpedienteWhereInput
  }

  export type ExpedienteUpdateToOneWithWhereWithoutAsignacionesInput = {
    where?: ExpedienteWhereInput
    data: XOR<ExpedienteUpdateWithoutAsignacionesInput, ExpedienteUncheckedUpdateWithoutAsignacionesInput>
  }

  export type ExpedienteUpdateWithoutAsignacionesInput = {
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    visitas?: VisitaAuditoriaUpdateManyWithoutExpedienteNestedInput
  }

  export type ExpedienteUncheckedUpdateWithoutAsignacionesInput = {
    id_expediente?: IntFieldUpdateOperationsInput | number
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput
  }

  export type UsuarioUpsertWithoutAsignacionesInput = {
    update: XOR<UsuarioUpdateWithoutAsignacionesInput, UsuarioUncheckedUpdateWithoutAsignacionesInput>
    create: XOR<UsuarioCreateWithoutAsignacionesInput, UsuarioUncheckedCreateWithoutAsignacionesInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutAsignacionesInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutAsignacionesInput, UsuarioUncheckedUpdateWithoutAsignacionesInput>
  }

  export type UsuarioUpdateWithoutAsignacionesInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    visitas?: VisitaAuditoriaUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutAsignacionesInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    visitas?: VisitaAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ExpedienteCreateWithoutVisitasInput = {
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteUncheckedCreateWithoutVisitasInput = {
    id_expediente?: number
    codigo_expediente: string
    tipo_credito?: $Enums.TipoCredito
    oficina?: string | null
    tipo_documento_cliente?: $Enums.TipoDocumento
    numero_documento_cliente: string
    nombres_cliente: string
    telefono_cliente?: string | null
    direccion_domicilio?: string | null
    distrito?: string | null
    provincia?: string | null
    departamento?: string | null
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asesor_responsable: string
    monto_desembolso?: Decimal | DecimalJsLike | number | string | null
    moneda?: string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutExpedienteInput
  }

  export type ExpedienteCreateOrConnectWithoutVisitasInput = {
    where: ExpedienteWhereUniqueInput
    create: XOR<ExpedienteCreateWithoutVisitasInput, ExpedienteUncheckedCreateWithoutVisitasInput>
  }

  export type UsuarioCreateWithoutVisitasInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutVisitasInput = {
    id_usuario?: string
    username: string
    nombres?: string | null
    apellidos?: string | null
    email?: string | null
    sede?: string | null
    departamento?: string | null
    password_hash: string
    rol: string
    estado?: string
    fecha_creacion?: Date | string
    mfa_habilitado?: boolean
    mfa_requerido?: boolean
    mfa_exento?: boolean
    mfa_secreto?: string | null
    mfa_ultimo_uso?: Date | string | null
    token_version?: number
    intentos_fallidos?: number
    bloqueado_hasta?: Date | string | null
    ultimo_acceso?: Date | string | null
    password_cambio?: Date | string
    latitud?: Decimal | DecimalJsLike | number | string | null
    longitud?: Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedCreateNestedManyWithoutAuditorInput
    dispositivos?: DispositivoAutorizadoUncheckedCreateNestedManyWithoutUsuarioInput
    trackings?: TrackingUbicacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutVisitasInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutVisitasInput, UsuarioUncheckedCreateWithoutVisitasInput>
  }

  export type EvidenciaCreateWithoutVisitaInput = {
    id_evidencia?: string
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
  }

  export type EvidenciaUncheckedCreateWithoutVisitaInput = {
    id_evidencia?: string
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
  }

  export type EvidenciaCreateOrConnectWithoutVisitaInput = {
    where: EvidenciaWhereUniqueInput
    create: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput>
  }

  export type EvidenciaCreateManyVisitaInputEnvelope = {
    data: EvidenciaCreateManyVisitaInput | EvidenciaCreateManyVisitaInput[]
    skipDuplicates?: boolean
  }

  export type ExpedienteUpsertWithoutVisitasInput = {
    update: XOR<ExpedienteUpdateWithoutVisitasInput, ExpedienteUncheckedUpdateWithoutVisitasInput>
    create: XOR<ExpedienteCreateWithoutVisitasInput, ExpedienteUncheckedCreateWithoutVisitasInput>
    where?: ExpedienteWhereInput
  }

  export type ExpedienteUpdateToOneWithWhereWithoutVisitasInput = {
    where?: ExpedienteWhereInput
    data: XOR<ExpedienteUpdateWithoutVisitasInput, ExpedienteUncheckedUpdateWithoutVisitasInput>
  }

  export type ExpedienteUpdateWithoutVisitasInput = {
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutExpedienteNestedInput
  }

  export type ExpedienteUncheckedUpdateWithoutVisitasInput = {
    id_expediente?: IntFieldUpdateOperationsInput | number
    codigo_expediente?: StringFieldUpdateOperationsInput | string
    tipo_credito?: EnumTipoCreditoFieldUpdateOperationsInput | $Enums.TipoCredito
    oficina?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_documento_cliente?: EnumTipoDocumentoFieldUpdateOperationsInput | $Enums.TipoDocumento
    numero_documento_cliente?: StringFieldUpdateOperationsInput | string
    nombres_cliente?: StringFieldUpdateOperationsInput | string
    telefono_cliente?: NullableStringFieldUpdateOperationsInput | string | null
    direccion_domicilio?: NullableStringFieldUpdateOperationsInput | string | null
    distrito?: NullableStringFieldUpdateOperationsInput | string | null
    provincia?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asesor_responsable?: StringFieldUpdateOperationsInput | string
    monto_desembolso?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: NullableStringFieldUpdateOperationsInput | string | null
    datos_cliente?: NullableJsonNullValueInput | InputJsonValue
    datos_negocio?: NullableJsonNullValueInput | InputJsonValue
    datos_credito?: NullableJsonNullValueInput | InputJsonValue
    evaluacion_financiera?: NullableJsonNullValueInput | InputJsonValue
    endeudamiento?: NullableJsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutExpedienteNestedInput
  }

  export type UsuarioUpsertWithoutVisitasInput = {
    update: XOR<UsuarioUpdateWithoutVisitasInput, UsuarioUncheckedUpdateWithoutVisitasInput>
    create: XOR<UsuarioCreateWithoutVisitasInput, UsuarioUncheckedCreateWithoutVisitasInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutVisitasInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutVisitasInput, UsuarioUncheckedUpdateWithoutVisitasInput>
  }

  export type UsuarioUpdateWithoutVisitasInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutVisitasInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    nombres?: NullableStringFieldUpdateOperationsInput | string | null
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    sede?: NullableStringFieldUpdateOperationsInput | string | null
    departamento?: NullableStringFieldUpdateOperationsInput | string | null
    password_hash?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa_habilitado?: BoolFieldUpdateOperationsInput | boolean
    mfa_requerido?: BoolFieldUpdateOperationsInput | boolean
    mfa_exento?: BoolFieldUpdateOperationsInput | boolean
    mfa_secreto?: NullableStringFieldUpdateOperationsInput | string | null
    mfa_ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    intentos_fallidos?: IntFieldUpdateOperationsInput | number
    bloqueado_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultimo_acceso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password_cambio?: DateTimeFieldUpdateOperationsInput | Date | string
    latitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    asignaciones?: AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorNestedInput
    dispositivos?: DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioNestedInput
    trackings?: TrackingUbicacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type EvidenciaUpsertWithWhereUniqueWithoutVisitaInput = {
    where: EvidenciaWhereUniqueInput
    update: XOR<EvidenciaUpdateWithoutVisitaInput, EvidenciaUncheckedUpdateWithoutVisitaInput>
    create: XOR<EvidenciaCreateWithoutVisitaInput, EvidenciaUncheckedCreateWithoutVisitaInput>
  }

  export type EvidenciaUpdateWithWhereUniqueWithoutVisitaInput = {
    where: EvidenciaWhereUniqueInput
    data: XOR<EvidenciaUpdateWithoutVisitaInput, EvidenciaUncheckedUpdateWithoutVisitaInput>
  }

  export type EvidenciaUpdateManyWithWhereWithoutVisitaInput = {
    where: EvidenciaScalarWhereInput
    data: XOR<EvidenciaUpdateManyMutationInput, EvidenciaUncheckedUpdateManyWithoutVisitaInput>
  }

  export type EvidenciaScalarWhereInput = {
    AND?: EvidenciaScalarWhereInput | EvidenciaScalarWhereInput[]
    OR?: EvidenciaScalarWhereInput[]
    NOT?: EvidenciaScalarWhereInput | EvidenciaScalarWhereInput[]
    id_evidencia?: StringFilter<"Evidencia"> | string
    id_visita?: IntFilter<"Evidencia"> | number
    tipo?: StringFilter<"Evidencia"> | string
    object_key?: StringFilter<"Evidencia"> | string
    hash_sha256?: StringFilter<"Evidencia"> | string
    latitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: DecimalNullableFilter<"Evidencia"> | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFilter<"Evidencia"> | Date | string
    fecha_creacion?: DateTimeFilter<"Evidencia"> | Date | string
  }

  export type VisitaAuditoriaCreateWithoutEvidenciasInput = {
    client_sync_id?: string | null
    id_asignacion?: number | null
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
    expediente: ExpedienteCreateNestedOneWithoutVisitasInput
    auditor: UsuarioCreateNestedOneWithoutVisitasInput
  }

  export type VisitaAuditoriaUncheckedCreateWithoutEvidenciasInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_expediente: number
    id_usuario_auditor: string
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
  }

  export type VisitaAuditoriaCreateOrConnectWithoutEvidenciasInput = {
    where: VisitaAuditoriaWhereUniqueInput
    create: XOR<VisitaAuditoriaCreateWithoutEvidenciasInput, VisitaAuditoriaUncheckedCreateWithoutEvidenciasInput>
  }

  export type VisitaAuditoriaUpsertWithoutEvidenciasInput = {
    update: XOR<VisitaAuditoriaUpdateWithoutEvidenciasInput, VisitaAuditoriaUncheckedUpdateWithoutEvidenciasInput>
    create: XOR<VisitaAuditoriaCreateWithoutEvidenciasInput, VisitaAuditoriaUncheckedCreateWithoutEvidenciasInput>
    where?: VisitaAuditoriaWhereInput
  }

  export type VisitaAuditoriaUpdateToOneWithWhereWithoutEvidenciasInput = {
    where?: VisitaAuditoriaWhereInput
    data: XOR<VisitaAuditoriaUpdateWithoutEvidenciasInput, VisitaAuditoriaUncheckedUpdateWithoutEvidenciasInput>
  }

  export type VisitaAuditoriaUpdateWithoutEvidenciasInput = {
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    expediente?: ExpedienteUpdateOneRequiredWithoutVisitasNestedInput
    auditor?: UsuarioUpdateOneRequiredWithoutVisitasNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateWithoutEvidenciasInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_expediente?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionAuditoriaCreateManyAuditorInput = {
    id_asignacion?: number
    id_expediente: number
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type VisitaAuditoriaCreateManyAuditorInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_expediente: number
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
  }

  export type DispositivoAutorizadoCreateManyUsuarioInput = {
    id_dispositivo?: string
    device_id: string
    nombre_dispositivo?: string | null
    activo?: boolean
    primer_uso?: Date | string
    ultimo_uso?: Date | string | null
  }

  export type TrackingUbicacionCreateManyUsuarioInput = {
    id_tracking?: bigint | number
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    registrado_en?: Date | string
  }

  export type AsignacionAuditoriaUpdateWithoutAuditorInput = {
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    expediente?: ExpedienteUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type AsignacionAuditoriaUncheckedUpdateWithoutAuditorInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_expediente?: IntFieldUpdateOperationsInput | number
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type AsignacionAuditoriaUncheckedUpdateManyWithoutAuditorInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_expediente?: IntFieldUpdateOperationsInput | number
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type VisitaAuditoriaUpdateWithoutAuditorInput = {
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    expediente?: ExpedienteUpdateOneRequiredWithoutVisitasNestedInput
    evidencias?: EvidenciaUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateWithoutAuditorInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_expediente?: IntFieldUpdateOperationsInput | number
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    evidencias?: EvidenciaUncheckedUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateManyWithoutAuditorInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_expediente?: IntFieldUpdateOperationsInput | number
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispositivoAutorizadoUpdateWithoutUsuarioInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispositivoAutorizadoUncheckedUpdateWithoutUsuarioInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispositivoAutorizadoUncheckedUpdateManyWithoutUsuarioInput = {
    id_dispositivo?: StringFieldUpdateOperationsInput | string
    device_id?: StringFieldUpdateOperationsInput | string
    nombre_dispositivo?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    primer_uso?: DateTimeFieldUpdateOperationsInput | Date | string
    ultimo_uso?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TrackingUbicacionUpdateWithoutUsuarioInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackingUbicacionUncheckedUpdateWithoutUsuarioInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackingUbicacionUncheckedUpdateManyWithoutUsuarioInput = {
    id_tracking?: BigIntFieldUpdateOperationsInput | bigint | number
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    registrado_en?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionAuditoriaCreateManyExpedienteInput = {
    id_asignacion?: number
    id_usuario_auditor: string
    fecha_asignacion?: Date | string
    fecha_fin?: Date | string | null
    estado?: string
    prioridad?: string
  }

  export type VisitaAuditoriaCreateManyExpedienteInput = {
    id_visita?: number
    client_sync_id?: string | null
    id_asignacion?: number | null
    id_usuario_auditor: string
    fecha_hora_checkin: Date | string
    fecha_hora_checkout?: Date | string | null
    latitud: Decimal | DecimalJsLike | number | string
    longitud: Decimal | DecimalJsLike | number | string
    precision_metros?: Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: Decimal | DecimalJsLike | number | string | null
    mock_location?: boolean
    device_integrity_ok?: boolean
    device_id?: string | null
    server_received_at?: Date | string
    resultado: string
    respuestas_cuestionario: JsonNullValueInput | InputJsonValue
    comentario_negocio?: string | null
    comentario_auditor?: string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: string | null
    estado?: string
    fecha_creacion?: Date | string
    fecha_actualizar?: Date | string
  }

  export type AsignacionAuditoriaUpdateWithoutExpedienteInput = {
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    auditor?: UsuarioUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type AsignacionAuditoriaUncheckedUpdateWithoutExpedienteInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type AsignacionAuditoriaUncheckedUpdateManyWithoutExpedienteInput = {
    id_asignacion?: IntFieldUpdateOperationsInput | number
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_asignacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
  }

  export type VisitaAuditoriaUpdateWithoutExpedienteInput = {
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    auditor?: UsuarioUpdateOneRequiredWithoutVisitasNestedInput
    evidencias?: EvidenciaUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateWithoutExpedienteInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
    evidencias?: EvidenciaUncheckedUpdateManyWithoutVisitaNestedInput
  }

  export type VisitaAuditoriaUncheckedUpdateManyWithoutExpedienteInput = {
    id_visita?: IntFieldUpdateOperationsInput | number
    client_sync_id?: NullableStringFieldUpdateOperationsInput | string | null
    id_asignacion?: NullableIntFieldUpdateOperationsInput | number | null
    id_usuario_auditor?: StringFieldUpdateOperationsInput | string
    fecha_hora_checkin?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_hora_checkout?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    latitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    longitud?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precision_metros?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    distancia_domicilio_m?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mock_location?: BoolFieldUpdateOperationsInput | boolean
    device_integrity_ok?: BoolFieldUpdateOperationsInput | boolean
    device_id?: NullableStringFieldUpdateOperationsInput | string | null
    server_received_at?: DateTimeFieldUpdateOperationsInput | Date | string
    resultado?: StringFieldUpdateOperationsInput | string
    respuestas_cuestionario?: JsonNullValueInput | InputJsonValue
    comentario_negocio?: NullableStringFieldUpdateOperationsInput | string | null
    comentario_auditor?: NullableStringFieldUpdateOperationsInput | string | null
    otros_clientes_domicilio?: NullableJsonNullValueInput | InputJsonValue
    otros_ingresos?: NullableJsonNullValueInput | InputJsonValue
    firma_evidencia?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_actualizar?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaCreateManyVisitaInput = {
    id_evidencia?: string
    tipo: string
    object_key: string
    hash_sha256: string
    latitud_captura?: Decimal | DecimalJsLike | number | string | null
    longitud_captura?: Decimal | DecimalJsLike | number | string | null
    capturado_en: Date | string
    fecha_creacion?: Date | string
  }

  export type EvidenciaUpdateWithoutVisitaInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaUncheckedUpdateWithoutVisitaInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenciaUncheckedUpdateManyWithoutVisitaInput = {
    id_evidencia?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    object_key?: StringFieldUpdateOperationsInput | string
    hash_sha256?: StringFieldUpdateOperationsInput | string
    latitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitud_captura?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    capturado_en?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
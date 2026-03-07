import type { Compiler } from 'webpack'

declare namespace DotenvWebpack {
  interface DotenvOptions {
    path?: string | false
    safe?: boolean | string
    allowEmptyValues?: boolean
    systemvars?: boolean
    silent?: boolean
    expand?: boolean
    defaults?: boolean | string
    ignoreStub?: boolean
    prefix?: string
  }
}

declare class Dotenv {
  constructor(config?: DotenvWebpack.DotenvOptions)
  apply(compiler: Compiler): void
}

export = Dotenv

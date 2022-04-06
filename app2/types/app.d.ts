declare module 'app1/RemoteComponent' {
  export default React.Component
}

declare module 'app1/Marketing' {
  export default React.Component
}

declare module 'app2/useApp2ConsoleMessage' {
  export default function(msg: string): void
}


declare namespace React {
  export type ReactEmpty = null | void | boolean;
  export type ReactNodeList = ReactEmpty | ReactNode;
}

declare module 'react-dom/server' {
  type Writable = import('node:stream')
  export function renderToPipeableStream(
    nodes: React.ReactNodeList,
    options?: {
      identifierPrefix?: string,
      namespaceURI?: string,
      nonce?: string,
      bootstrapScriptContent?: string,
      bootstrapScripts?: Array<string>,
      bootstrapModules?: Array<string>,
      progressiveChunkSize?: number,
      onShellReady?: () => void,
      onShellError?: (error: any) => void,
      onAllReady?: () => void,
      onError?: (error: any) => void,
    }
  ): {
    abort(): void,
    pipe<T extends Writable>(destination: T): T,
  }
}
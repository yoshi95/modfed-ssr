declare module 'app1/RemoteComponent' {
  export default React.Component
}

declare module 'app1/Marketing' {
  export default React.Component
}

declare module 'app2/useApp2ConsoleMessage' {
  export default function(msg: string): void
}


declare var __webpack_require__: { flushExternals: () => void }

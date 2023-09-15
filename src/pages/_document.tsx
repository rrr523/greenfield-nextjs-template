import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
      <script src="https://unpkg.com/@bnb-chain/greenfiled-file-handle@0.2.1/dist/browser/umd/index.js"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__PUBLIC_FILE_HANDLE_WASM_PATH__ = 'https://unpkg.com/@bnb-chain/greenfiled-file-handle@0.2.1/dist/node/file-handle.wasm'`,
        }}
      ></script>
    </Html>
  )
}

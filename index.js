import fp from 'fastify-plugin'

const processFromTo = ({ from, to }) => {
  if (!from || !to) return {}
  if (from.endsWith('/')) throw Error(`Proxy 'from' field cannot end in / - caused by: ` + from)
  const url = new URL(to)
  const upstream = url.origin
  const rewritePrefix = url.pathname
  return {
    prefix: from,
    upstream,
    rewritePrefix,
  }
}

export const wrapProxyPlugin = (proxyPlugin) => fp((server, { from, to, ...opts }, done) => {
  server.register(proxyPlugin, {
    undici: false,
    ...processFromTo({ from, to }),
    ...opts
  })
  done()
})

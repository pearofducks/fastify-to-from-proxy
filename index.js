import fp from 'fastify-plugin'

const processFromTo = ({ from, to }) => {
  if (!from || !to) return {}
  const prefix = from.endsWith('/') ? from.slice(0, -1) : from
  const url = new URL(to)
  const upstream = url.origin
  const rewritePrefix = url.pathname
  return {
    prefix,
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

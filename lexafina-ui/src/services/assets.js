// Helper xây URL tới backend asset endpoint.
// Backend đảm bảo: image fallback CDN qua 302 nếu chưa có local.

const ASSET_BASE = '/api/assets'

export function audioUrl(fileId) {
  if (!fileId) return ''
  return `${ASSET_BASE}/audio/${encodeURIComponent(fileId)}`
}

export function imageUrl(uuid) {
  if (!uuid) return ''
  return `${ASSET_BASE}/image/${encodeURIComponent(uuid)}`
}

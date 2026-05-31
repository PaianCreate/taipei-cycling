// 產生 40 條路線的 GPX：geocode 路線中的地名 → OSRM 計算單車路徑 → 輸出 .gpx
// 用法：node scripts/generate-gpx.mjs [起始 id] [結束 id]
//   範例：node scripts/generate-gpx.mjs 1 5   # 只跑 1-5
//   無參數則跑全部 1-40

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { ROUTES } from '../src/data/routes.js'

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const OSRM      = 'https://router.project-osrm.org/route/v1/cycling'
const UA        = 'roll-the-route-paiancreate.vercel.app GPX generator'

const args = process.argv.slice(2).map(Number)
const FROM = args[0] || 1
const TO   = args[1] || 40

// ── 從 gmapUrl 撈出 waypoint 名稱 ─────────────────────
function parseWaypoints(url) {
  const match = url.match(/\/dir\/([^?]+)/)
  if (!match) return []
  return match[1]
    .split('/')
    .filter(Boolean)
    .map(s => decodeURIComponent(s).replace(/\+/g, ' ').trim())
}

// ── Nominatim 中文地名 → lat/lng ─────────────────────
async function geocode(place) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(place)}&format=json&limit=1&countrycodes=tw`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW,en' } })
    const json = await res.json()
    if (!json[0]) return null
    return { lat: +json[0].lat, lon: +json[0].lon, display: json[0].display_name }
  } catch (e) {
    return null
  }
}

// ── OSRM bike profile：將多個 lat/lng 串成單車路徑 ────
async function routeBike(coords) {
  if (coords.length < 2) return null
  const coordStr = coords.map(c => `${c.lon},${c.lat}`).join(';')
  const url = `${OSRM}/${coordStr}?geometries=geojson&overview=full`
  try {
    const res = await fetch(url)
    const json = await res.json()
    if (!json.routes?.[0]) return null
    return {
      points: json.routes[0].geometry.coordinates, // [[lon, lat], ...]
      distance: json.routes[0].distance,
      duration: json.routes[0].duration,
    }
  } catch (e) {
    return null
  }
}

// ── GeoJSON points → GPX XML ─────────────────────────
function toGpx(route, points) {
  const escape = s => String(s).replace(/[<>&'"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' }[c]))
  const trkpts = points.map(([lon, lat]) => `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"/>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Roll the Route" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escape(route.zh)}</name>
    <desc>${escape(route.en)} — ${route.km} km / ${route.elev} m / ${route.avgGrade}% avg</desc>
    <link href="https://roll-the-route-paiancreate.vercel.app/"><text>Roll the Route</text></link>
  </metadata>
  <trk>
    <name>${escape(route.zh)}</name>
    <type>${route.cat}</type>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`
}

// ── 主流程 ─────────────────────────────────────────
mkdirSync('public/gpx', { recursive: true })
const log = []

for (const route of ROUTES) {
  if (route.id < FROM || route.id > TO) continue

  const outPath = `public/gpx/route-${String(route.id).padStart(2, '0')}.gpx`
  console.log(`\n[${route.id}/40] ${route.zh}`)

  const places = parseWaypoints(route.gmapUrl)
  if (places.length < 2) {
    console.log(`  ⚠️  跳過：gmapUrl 解析不到 waypoint`)
    log.push({ id: route.id, status: 'fail-parse' })
    continue
  }
  console.log(`  waypoints: ${places.join(' → ')}`)

  const coords = []
  const failed = []
  for (const p of places) {
    process.stdout.write(`  geocode "${p}" ... `)
    const c = await geocode(p)
    if (c) {
      console.log(`✓ ${c.lat.toFixed(4)},${c.lon.toFixed(4)}`)
      coords.push(c)
    } else {
      console.log('✗')
      failed.push(p)
    }
    await new Promise(r => setTimeout(r, 1100)) // Nominatim 1 req/sec rate limit
  }

  if (coords.length < 2) {
    console.log(`  ⚠️  跳過：geocoding 失敗（${failed.join(', ')}）`)
    log.push({ id: route.id, status: 'fail-geocode', failed })
    continue
  }

  console.log(`  routing via OSRM ...`)
  const result = await routeBike(coords)
  if (!result) {
    console.log(`  ⚠️  跳過：OSRM 失敗`)
    log.push({ id: route.id, status: 'fail-osrm' })
    continue
  }
  const distKm = (result.distance / 1000).toFixed(1)
  console.log(`  ✓ ${result.points.length} 點 / ${distKm} km`)

  writeFileSync(outPath, toGpx(route, result.points))
  log.push({ id: route.id, status: 'ok', points: result.points.length, dist: distKm })
}

console.log('\n──── 結果 ────')
const ok = log.filter(l => l.status === 'ok').length
const fail = log.length - ok
console.log(`成功 ${ok} / 失敗 ${fail}`)
log.filter(l => l.status !== 'ok').forEach(l => console.log(`  #${l.id}: ${l.status}${l.failed ? ' — ' + l.failed.join(', ') : ''}`))

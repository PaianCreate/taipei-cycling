// GPX 半自動下載流程：
//   1. 複製路線的 Google Maps URL 到剪貼簿
//   2. 開啟 mapstogpx.com 新分頁
//   3. 顯示 toast 告訴使用者下一步動作
//
// 為什麼不直接產 GPX？因為路線資料只有中文 waypoint 名稱，自動 geocode 不準確，
// 會做出錯誤的 .gpx 上 Garmin 騎錯路。改成讓使用者在 mapstogpx 上完成最後一步
// （該站直接讀 Google Maps URL，路徑準確）。

const TOAST_DURATION = 6000

let toastTimer = null

function showToast(html) {
  // 移除前一個
  document.querySelectorAll('.gpx-toast').forEach(el => el.remove())
  if (toastTimer) clearTimeout(toastTimer)

  const el = document.createElement('div')
  el.className = 'gpx-toast'
  el.innerHTML = html
  document.body.appendChild(el)

  toastTimer = setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, TOAST_DURATION)
}

export async function downloadGpx(route) {
  const url = route.gmapUrl
  if (!url) {
    showToast('這條路線目前沒有 Google Maps 連結 🥲')
    return
  }

  // 複製到剪貼簿
  let copied = false
  try {
    await navigator.clipboard.writeText(url)
    copied = true
  } catch {
    // fallback：顯示 prompt 讓使用者手動複製
  }

  // 開啟 mapstogpx
  window.open('https://mapstogpx.com/', '_blank', 'noopener')

  showToast(
    copied
      ? `已複製 <b>${route.zh}</b> 的 Google Maps 連結 🔗<br/>到新分頁的 <b>mapstogpx</b> 貼上後按 <b>Let's Go</b> 即可下載 GPX`
      : `請手動複製這條的 Google Maps 連結到 <b>mapstogpx</b> 完成轉檔`
  )
}

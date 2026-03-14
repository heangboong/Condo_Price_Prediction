/* ============================================================
   app.js — CondoIQ Frontend Logic
   ============================================================
   Organized in 4 sections:

     1. CONFIG        — API base URL (one place to change it)
     2. TAB SWITCHING — show/hide panels when nav is clicked
     3. API CALLS     — all fetch() functions together
     4. PAGE LOGIC    — what each panel does

   Key concept — async/await:
     HTTP requests take time. We can't just write:
       const data = fetch(url)   ← this doesn't work

     We must wait for the response:
       const data = await fetch(url)  ← this works

     Any function that uses "await" must be marked "async".
   ============================================================ */


/* ============================================================
   1. CONFIG
   ============================================================ */
const API = "https://condopricepredictionbackend.vercel.app"


/* ============================================================
   2. TAB SWITCHING
   ============================================================
   Reads data-tab attribute from each nav button.
   Matches it to the panel id (e.g. "predict" → "tab-predict").
   ============================================================ */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all nav items and panels
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))

    // Activate clicked nav item and its panel
    btn.classList.add('active')
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active')

    // Load data when switching to a panel
    if (btn.dataset.tab === 'properties') loadProperties()
    if (btn.dataset.tab === 'history')    loadHistory()
  })
})


/* ============================================================
   3. API CALLS
   ============================================================
   All fetch() functions live here — centralized, not scattered.
   Each function does ONE thing: make a request and return data.
   Error handling (what to show the user) is in Section 4.
   ============================================================ */

/* GET /health */
async function fetchHealth() {
  const res = await fetch(`${API}/health`)
  return res.json()
}

/* POST /predict */
async function fetchPrediction(area, bedroom, khan, sangkat) {
  const res = await fetch(`${API}/predict`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ area, bedroom, khan, sangkat })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Prediction failed')
  }
  return res.json()
}

/* GET /api/v1/properties */
async function fetchProperties() {
  const res = await fetch(`${API}/api/v1/properties`)
  if (!res.ok) throw new Error('Could not load properties')
  return res.json()
}

/* POST /api/v1/properties */
async function postProperty(data) {
  const res = await fetch(`${API}/api/v1/properties`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Could not save property')
  }
  return res.json()
}

/* DELETE /api/v1/properties/{id} */
async function deletePropertyById(id) {
  const res = await fetch(`${API}/api/v1/properties/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Could not delete property')
}

/* GET /predictions */
async function fetchHistory() {
  const res = await fetch(`${API}/predictions?limit=20`)
  if (!res.ok) throw new Error('Could not load history')
  return res.json()
}


/* ============================================================
   4. PAGE LOGIC
   ============================================================ */

/* ── Health check ─────────────────────────────────────────────
   Runs on page load. Updates the sidebar status indicator.
──────────────────────────────────────────────────────────── */
async function checkHealth() {
  try {
    const data = await fetchHealth()
    const dot  = document.getElementById('statusDot')
    const text = document.getElementById('statusText')
    dot.className    = 'status-dot online'
    text.textContent = data.model_loaded ? 'Model ready' : 'No model'
  } catch {
    document.getElementById('statusDot').className = 'status-dot offline'
    document.getElementById('statusText').textContent = 'Offline'
  }
}


/* ── Predict ──────────────────────────────────────────────────
   Reads form → calls API → shows result or error.
──────────────────────────────────────────────────────────── */
async function runPredict() {
  const btn     = document.getElementById('predictBtn')
  const btnText = document.querySelector('.btn-predict-text')
  const errorEl = document.getElementById('predictError')

  // Loading state
  btn.disabled     = true
  btnText.innerHTML = '<span class="spinner"></span>Running model...'
  errorEl.style.display = 'none'
  document.getElementById('resultIdle').style.display = 'none'
  document.getElementById('resultData').style.display = 'none'

  try {
    const area    = parseFloat(document.getElementById('p-area').value)
    const bedroom = parseInt(document.getElementById('p-bedroom').value)
    const khan    = document.getElementById('p-khan').value
    const sangkat = document.getElementById('p-sangkat').value

    const data = await fetchPrediction(area, bedroom, khan, sangkat)

    // Show result
    document.getElementById('resultAmount').textContent =
      '$' + data.estimated_price.toLocaleString()

    // Build detail tags
    document.getElementById('resultTags').innerHTML = [
      `${area}m²`, `${bedroom} bedroom`, khan, sangkat
    ].map(t => `<span class="result-tag">${t}</span>`).join('')

    document.getElementById('resultData').style.display = 'block'

  } catch (err) {
    // Show error, restore idle state in result card
    errorEl.textContent   = '⚠️  ' + err.message
    errorEl.style.display = 'block'
    document.getElementById('resultIdle').style.display = 'block'

  } finally {
    btn.disabled      = false
    btnText.textContent = 'Run Prediction'
  }
}


/* ── Properties — load list ───────────────────────────────────
   Fetches all properties and renders them as cards.
──────────────────────────────────────────────────────────── */
async function loadProperties() {
  const listEl  = document.getElementById('propList')
  const countEl = document.getElementById('propCount')

  try {
    const items = await fetchProperties()
    countEl.textContent = items.length + ' saved properties'

    if (items.length === 0) {
      listEl.innerHTML = '<p class="empty-state">No properties yet — add one above.</p>'
      return
    }

    listEl.innerHTML = '<div class="prop-list">' +
      items.map(p => `
        <div class="prop-item">
          <div>
            <div class="prop-name">${p.title}</div>
            <div class="prop-meta">
              <span>${p.area}m²</span>
              <span>·</span>
              <span>${p.bedroom} bed</span>
              <span>·</span>
              <span class="badge">${p.khan}</span>
              <span>${p.sangkat}</span>
            </div>
          </div>
          <div class="prop-right">
            <div class="prop-prices">
              ${p.predicted_price
                ? `<div class="prop-predicted">$${p.predicted_price.toLocaleString()}<span style="font-size:.65rem;font-weight:400;color:var(--ink-muted)">/mo</span></div>`
                : '<div style="font-size:.78rem;color:var(--ink-faint)">No prediction</div>'
              }
              ${p.actual_price
                ? `<div class="prop-actual">Listed $${p.actual_price.toLocaleString()}</div>`
                : ''
              }
            </div>
            <button class="btn-delete" onclick="handleDelete(${p.id})">Remove</button>
          </div>
        </div>
      `).join('') + '</div>'

  } catch (err) {
    listEl.innerHTML = `<div class="error-box">⚠️  ${err.message}</div>`
  }
}


/* ── Properties — save ────────────────────────────────────────
   Reads add form → POST to API → reload list.
──────────────────────────────────────────────────────────── */
async function saveProperty() {
  const btn     = document.getElementById('saveBtn')
  const errorEl = document.getElementById('formError')
  errorEl.style.display = 'none'
  btn.disabled  = true
  btn.innerHTML = '<span class="spinner"></span>Saving...'

  try {
    await postProperty({
      title:        document.getElementById('f-title').value,
      area:         parseFloat(document.getElementById('f-area').value),
      bedroom:      parseInt(document.getElementById('f-bedroom').value),
      khan:         document.getElementById('f-khan').value,
      sangkat:      document.getElementById('f-sangkat').value,
      actual_price: document.getElementById('f-actual').value
                      ? parseFloat(document.getElementById('f-actual').value) : null
    })
    // Hide form, clear title, reload list
    document.getElementById('addForm').style.display = 'none'
    document.getElementById('f-title').value = ''
    loadProperties()

  } catch (err) {
    errorEl.textContent   = '⚠️  ' + err.message
    errorEl.style.display = 'block'

  } finally {
    btn.disabled    = false
    btn.textContent = 'Save & Auto-predict'
  }
}


/* ── Properties — delete ──────────────────────────────────────
   Confirms, then sends DELETE, then reloads list.
──────────────────────────────────────────────────────────── */
async function handleDelete(id) {
  if (!confirm('Remove this property?')) return
  try {
    await deletePropertyById(id)
    loadProperties()
  } catch (err) {
    alert('Delete failed: ' + err.message)
  }
}


/* ── History ──────────────────────────────────────────────────
   Fetches prediction log and renders as a table.
──────────────────────────────────────────────────────────── */
async function loadHistory() {
  const el = document.getElementById('historyContent')
  try {
    const items = await fetchHistory()

    if (items.length === 0) {
      el.innerHTML = '<p class="empty-state">No predictions logged yet. Go to Predict first.</p>'
      return
    }

    el.innerHTML = `
      <table class="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Area</th>
            <th>Bed</th>
            <th>Khan</th>
            <th>Sangkat</th>
            <th>Estimated Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(h => `
            <tr>
              <td class="id-cell">${h.id}</td>
              <td>${h.area}m²</td>
              <td>${h.bedroom}</td>
              <td><span class="badge">${h.khan}</span></td>
              <td style="color:var(--ink-muted)">${h.sangkat}</td>
              <td class="price-cell">$${h.estimated_price.toLocaleString()}</td>
              <td style="color:var(--ink-muted);font-size:.78rem">
                ${new Date(h.created_at).toLocaleDateString()}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  } catch (err) {
    el.innerHTML = `<div class="error-box">⚠️  ${err.message}</div>`
  }
}


/* ── Event listeners ──────────────────────────────────────────
   Connect buttons to their functions.
──────────────────────────────────────────────────────────── */
document.getElementById('predictBtn').addEventListener('click', runPredict)
document.getElementById('saveBtn').addEventListener('click', saveProperty)

document.getElementById('toggleFormBtn').addEventListener('click', () => {
  const form   = document.getElementById('addForm')
  const isHidden = form.style.display === 'none'
  form.style.display = isHidden ? 'block' : 'none'
})

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('addForm').style.display  = 'none'
  document.getElementById('formError').style.display = 'none'
})


/* ── Init ─────────────────────────────────────────────────────
   Runs immediately when the page loads.
──────────────────────────────────────────────────────────── */
checkHealth()

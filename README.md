# Simple HTML Form → Google Sheets (Apps Script)

A minimal, modern HTML form that submits to a Google Apps Script web app and saves to a Google Sheet. Static hosting friendly (GitHub Pages, Netlify, Vercel).

- Frontend files: `index.html`, `assets/css/style.css`, `assets/js/script.js`
- Submission target: Google Apps Script Web App URL set in `assets/js/script.js` (`scriptURL`)

---

## How it works
- `index.html` defines fields: `name`, `email`, `message`, `address`.
- `assets/js/script.js` gathers inputs with `FormData(form)` and `POST`s them to your Apps Script Web App URL.
- Apps Script receives the POST in `doPost(e)`, reads values from `e.parameter`, and appends a row to a Google Sheet.

---

## Quick start
1. Open `assets/js/script.js` and replace the placeholder `scriptURL` with your Apps Script Web App URL.
2. Open `index.html` in a browser and submit a test entry.
3. If it fails, check the browser Network tab and the Apps Script deployment/access settings.

---

## Set up Google Apps Script + Google Sheet

### 1) Create a Google Sheet
- Create a new Google Sheet.
- Rename a tab (sheet) to `Responses` (or your choice; match the script).
- Optional: Add a header row in A1:E1, example: `Timestamp | Name | Email | Message | Address`.

### 2) Create an Apps Script project
- In the Sheet, go to Extensions → Apps Script.
- Replace code in `Code.gs` with the sample below.
- Update `SPREADSHEET_ID` with your Sheet ID (found in the Sheet URL) and `SHEET_NAME` if different.

```js
function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById('SPREADSHEET_ID');
    var sh = ss.getSheetByName('Responses') || ss.insertSheet('Responses');

    var p = e.parameter || {};
    var row = [
      new Date(),
      p.name || '',
      p.email || '',
      p.message || '',
      p.address || ''
    ];
    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Notes:
- Web Apps naturally allow cross-origin requests; you don’t need to add CORS headers.
- If you change the code later, you must redeploy a new version (next step).

### 3) Deploy as a Web App
- Click Deploy → Manage deployments → New deployment → Select type: Web app.
- Execute as: Me
- Who has access: Anyone (required for a public site without sign-in)
- Deploy and copy the Web App URL. It will look like `https://script.google.com/macros/s/AKfyc.../exec`.
- Paste that URL into `assets/js/script.js` as `scriptURL`.

---

## Expanding the form (frontend and Apps Script)

### Add new fields (text, textarea, select, radio, checkbox)
1. In `index.html`, add a new field with a `name` attribute (this is the key Apps Script will receive). Example:

```html
<div class="field">
  <label for="phone">Phone</label>
  <input id="phone" type="tel" name="phone" placeholder="+1 555-555-5555">
</div>
```

2. No change needed in `assets/js/script.js`; `FormData(form)` auto-includes all inputs with a `name`.
3. In Apps Script, update the `appendRow` order to include the new field(s):

```js
var row = [
  new Date(),
  p.name || '',
  p.email || '',
  p.message || '',
  p.address || '',
  p.phone || '' // new field
];
```

4. In the Sheet, add matching header columns (optional but recommended).

### Map by header name (optional, scalable)
If you prefer not to maintain column order, you can map values by the header names in row 1 (A1:Z1):

```js
function doPost(e) {
  var ss = SpreadsheetApp.openById('SPREADSHEET_ID');
  var sh = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
  var p = e.parameter || {};

  var headers = sh.getLastRow() >= 1
    ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    : [];

  if (headers.length === 0) {
    headers = ['Timestamp', 'name', 'email', 'message', 'address'];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var data = headers.map(function (h) {
    if (h === 'Timestamp') return new Date();
    return p[h] || '';
  });

  sh.appendRow(data);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Client-side validation
- Use HTML attributes: `required`, `pattern`, `minlength`, etc., in `index.html`.
- The script already calls `form.reportValidity()`; add custom checks in `assets/js/script.js` before posting if needed.

### File uploads (advanced)
- Apps Script can receive multipart/form-data, but handling binary files from an external static site is non-trivial.
- Recommended options:
  - Use a Google Form for file uploads.
  - Or send to a Cloud Function/Cloud Run that stores files in Cloud Storage, then logs metadata to Sheets.

---

## Hosting options

### GitHub Pages
- Push this folder to a GitHub repo.
- Settings → Pages → Build and deployment → Deploy from a branch.
- Branch: `main` (or `master`) • Folder: `/ (root)`.
- Wait for the published URL; update links if needed.

### Netlify
- Drag-and-drop the project folder at https://app.netlify.com/drop or connect the Git repo.
- Build command: none
- Publish directory: project root (the folder containing `index.html`).

### Vercel
- Import the Git repo in https://vercel.com/new.
- Framework preset: Other
- Output directory: project root
- No build command.

### Local
- Just open `index.html` in your browser.

---

## Troubleshooting
- "Submission failed":
  - Confirm `scriptURL` is correct in `assets/js/script.js`.
  - Confirm Apps Script deployment access is set to "Anyone".
  - If you updated the code, redeploy a new version and use the new URL.
  - Check browser DevTools → Network for the POST and response body.
- Empty rows: Make sure your field `name` attributes match the keys you read in Apps Script (e.g., `p.name`).
- Mixed-up columns: Either keep a consistent column order or use the header-based mapping approach.

---

## Security and privacy
- The Web App set to "Anyone" accepts anonymous submissions. Share the URL carefully.
- Do not collect sensitive information unless you have consent and proper safeguards.
- Consider adding CAPTCHA/rate-limiting or validating origin if abuse is a concern.

---

## Project structure
```
form/
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     └─ script.js
└─ README.md
```

METER QR INSPECTION - UPDATED BUILD

UPDATED FIELDS
- Removed Team Name.
- Removed Project.
- Removed Communication Status.
- Meter Type dropdown: 1PH RF, 1PH GPRS, 3PH RF, 3PH GPRS, LTCT, HTCT, 5A/100 RF, 5A/100 GPRS, 5A/200 RF, 5A/200 GPRS.
- Relay Status dropdown: Open/Close, Open, Close, Not Visible.
- Final Remarks dropdown: Display Out, Terminal issue, Meter Burnt, NIC point issue, Meter damage, RTC issue, Load change.

WINDOWS / LAPTOP
1. Extract the ZIP file into a folder.
2. Double-click start-server.bat.
3. Keep the black command window open.
4. Open Chrome and visit: http://localhost:8000
5. Allow Camera permission and press Start Camera.

ANDROID
1. Open this app using an HTTPS hosting link in Chrome.
2. Allow Camera permission, then press Start Camera.
3. Use Chrome menu > Add to Home screen / Install app if available.

IMPORTANT
- First launch needs internet once to load QR decoding and Excel libraries from jsDelivr.
- QR scan fills Meter Sr No and saves a record automatically.
- Duplicate Meter Sr No or identical QR payloads are skipped.
- Fill inspection fields after scanning, then tap Save Record to update that meter's record.
- Download Excel creates an .xlsx file (CSV fallback if Excel library is unavailable).
- Download & Start New Batch asks for confirmation before clearing the current batch.
- Records are stored locally in the browser on each device. Mobile and laptop data do not automatically sync.
- Maximum 200 records in one batch.

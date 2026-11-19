METER QR INSPECTION - FINAL BUILD

WINDOWS / LAPTOP
1. Extract the ZIP file into a folder.
2. Double-click start-server.bat.
3. Keep the black command window open.
4. Open Chrome and visit: http://localhost:8000
5. Allow Camera permission and press Start Camera.

ANDROID
1. Copy/extract the folder to your PC first, or host the app on an HTTPS web host.
2. Camera access on Android requires HTTPS or localhost. A plain http://PC-IP:8000 link may not allow camera access.
3. Open the HTTPS app link in Chrome, allow Camera permission, then use Start Camera.
4. Use Chrome menu > Add to Home screen / Install app if available.

IMPORTANT
- First launch needs internet once to load the QR decoding and Excel libraries from jsDelivr. The service worker then caches app files and libraries for later offline use in that browser.
- Keep Team Name and Project selected before scanning. A detected QR is automatically added as a record.
- Meter Sr No is extracted from JSON keys such as meterSrNo, meter_sr_no, meterSerialNo, serialNo, serial, meter_no or meterNo. If the QR payload is plain text, the full text is used as Meter Sr No.
- Duplicate Meter Sr No or identical QR payloads are skipped.
- Fill inspection fields after scanning, then tap Save Record to update that meter's record.
- Download Excel creates an .xlsx file (CSV fallback if Excel library is unavailable).
- Download & Start New Batch asks for confirmation, downloads the current batch, then clears it and starts the next batch.
- Data is stored in this browser's local storage on this device. It does not automatically sync between phone and laptop. Download and transfer the Excel file if you need to move records.
- Do not clear browser data/site storage until you have exported your records.
- Maximum 200 records in one batch.

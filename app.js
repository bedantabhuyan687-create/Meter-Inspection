(() => {
"use strict";
const $ = id => document.getElementById(id);
const fields = ["storeName","meterSrNo","meterType","meterDisplay","outputStatus","relayStatus","communicationType","mfgDate","finalRemarks","othersRemarks"];
const columns = ["Store Name","Meter Sr No","Meter Type","Meter Display","Output Status","Relay Status","Communication Type","MFG Date","Final Remarks","Others Remarks","QR Full Data","Scanned At"];
let records = JSON.parse(localStorage.getItem("meterInspectionRecords") || "[]");
let batchNo = Number(localStorage.getItem("meterInspectionBatch") || "1");
let stream = null, facing = "environment", scanning = false, lastPayload = "", lastAt = 0, raf = 0, detector = null;
const video = $("video"), canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", {willReadFrequently:true});
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function saveLocal(){localStorage.setItem("meterInspectionRecords",JSON.stringify(records));localStorage.setItem("meterInspectionBatch",String(batchNo));render()}
function getForm(){const o={};fields.forEach(k=>o[k]=$(k).value.trim());return o}
function fillForm(o){fields.forEach(k=>{if(o[k]!==undefined)$(k).value=o[k]})}
function clearForm(){fields.forEach(k=>$(k).value="")}
function render(){
 $("countTag").textContent=records.length+" / 200";
 $("batchStatus").textContent="Batch "+batchNo;
 $("batchMessage").textContent=records.length+" records saved. Maximum 200 records per batch.";
 $("progressBar").style.width=(records.length/200*100)+"%";
 $("recordRows").innerHTML=records.length?records.slice().reverse().slice(0,30).map((r,i)=>`<tr><td>${records.length-i}</td><td>${esc(r["Meter Sr No"])}</td><td>${esc(r["Meter Type"])}</td></tr>`).join(""):'<tr><td colspan="3">No records yet</td></tr>';
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function parseQR(raw){
 let serial="";
 try{
   const j=JSON.parse(raw);
   if(typeof j==="object"&&j){serial=j.meterSrNo||j.meter_sr_no||j.meterSerialNo||j.serialNo||j.serial||j.meter_no||j.meterNo||""}
 }catch{}
 if(!serial){const m=raw.match(/(?:meter\s*(?:sr\.?\s*)?no|serial(?:\s*no)?|meter[_ -]?serial)\s*[:=]\s*([A-Za-z0-9/_-]+)/i);if(m)serial=m[1]}
 if(!serial){const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);serial=lines.length===1?lines[0]:raw.trim()}
 return String(serial).trim();
}
function addQR(raw){
 const now=Date.now();if(raw===lastPayload&&now-lastAt<2500)return;lastPayload=raw;lastAt=now;
 const serial=parseQR(raw);$("meterSrNo").value=serial;
 const existing=records.some(r=>r["QR Full Data"]===raw || (serial && r["Meter Sr No"].toLowerCase()===serial.toLowerCase()));
 if(existing){toast("Duplicate QR skipped: "+serial);return}
 if(records.length>=200){toast("200 records complete. Download Excel and start a new batch.");return}
 const form=getForm();
 const rec=makeRecord(form,raw);records.push(rec);saveLocal();toast("QR captured and saved: "+serial);
 if(records.length===200)toast("200 records complete. Download Excel to start next batch.");
}
function makeRecord(f,raw){return {"Store Name":f.storeName,"Meter Sr No":f.meterSrNo,"Meter Type":f.meterType,"Meter Display":f.meterDisplay,"Output Status":f.outputStatus,"Relay Status":f.relayStatus,"Communication Type":f.communicationType,"MFG Date":f.mfgDate,"Final Remarks":f.finalRemarks,"Others Remarks":f.othersRemarks,"QR Full Data":raw,"Scanned At":new Date().toLocaleString()}}
function updateCurrentRecord(){
 const serial=$("meterSrNo").value.trim();if(!serial){toast("Scan QR or enter Meter Sr No first.");return}
 const idx=records.findIndex(r=>r["Meter Sr No"].toLowerCase()===serial.toLowerCase());
 const f=getForm();
 const old=idx>=0?records[idx]:null;
 const rec=makeRecord(f,old?old["QR Full Data"]:"Manual entry");
 if(idx>=0){records[idx]=rec;toast("Inspection details updated.")}else{if(records.length>=200){toast("Batch limit reached. Download Excel first.");return}records.push(rec);toast("Record saved.")}
 saveLocal();
}
function exportExcel(){
 if(!records.length){toast("No records to download.");return}
 const rows=records.map(r=>{const x={};columns.forEach(c=>x[c]=r[c]||"");return x});
 if(window.XLSX){const ws=XLSX.utils.json_to_sheet(rows,{header:columns});const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Meter Inspection");ws["!cols"]=columns.map(c=>({wch:Math.max(14,c.length+2)}));XLSX.writeFile(wb,`Meter_Inspection_Batch_${batchNo}.xlsx`)}
 else {const csv=[columns,...rows.map(r=>columns.map(c=>r[c]))].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=`Meter_Inspection_Batch_${batchNo}.csv`;a.click();URL.revokeObjectURL(a.href)}
 toast("Excel file download started.");
}
function downloadAndClear(){
 if(!records.length){toast("No records to download.");return}
 if(!confirm(`Download ${records.length} records and clear this batch? Make sure the file is saved.`))return;
 exportExcel();records=[];batchNo++;saveLocal();clearForm();toast("New batch "+batchNo+" started.");
}
async function startCamera(){
 if(!navigator.mediaDevices?.getUserMedia){toast("Camera unavailable. Open this app on localhost or HTTPS.");return}
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}});
  video.srcObject=stream;await video.play();scanning=true;
  $("cameraMessage").style.display="none";$("cameraState").textContent="Scanning automatically";
  $("startCamera").disabled=true;$("stopCamera").disabled=false;$("switchCamera").disabled=false;
  if("BarcodeDetector" in window){try{detector=new BarcodeDetector({formats:["qr_code"]})}catch{detector=null}}
  scanLoop();
 }catch(e){toast("Camera error: "+(e.message||e)+" — allow camera permission.");$("cameraState").textContent="Camera error"}
}
async function scanLoop(){
 if(!scanning)return;
 if(video.readyState>=2&&video.videoWidth){
  if(detector){
   try{const codes=await detector.detect(video);if(codes.length)addQR(codes[0].rawValue)}catch{}
  }else if(window.jsQR){
   canvas.width=video.videoWidth;canvas.height=video.videoHeight;ctx.drawImage(video,0,0,canvas.width,canvas.height);
   const img=ctx.getImageData(0,0,canvas.width,canvas.height);const code=jsQR(img.data,img.width,img.height,{inversionAttempts:"attemptBoth"});
   if(code?.data)addQR(code.data);
  }else{
   $("cameraMessage").style.display="block";$("cameraMessage").textContent="QR engine not loaded. Connect internet once, reload the app, then try again.";
  }
 }
 raf=requestAnimationFrame(scanLoop);
}
function stopCamera(){
 scanning=false;if(raf)cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;
 $("cameraState").textContent="Camera stopped";$("cameraMessage").style.display="block";$("cameraMessage").textContent="Tap “Start Camera” to begin automatic QR scanning.";
 $("startCamera").disabled=false;$("stopCamera").disabled=true;$("switchCamera").disabled=true;
}
async function switchCamera(){const next=facing==="environment"?"user":"environment";facing=next;stopCamera();await startCamera()}
$("startCamera").addEventListener("click",startCamera);$("stopCamera").addEventListener("click",stopCamera);$("switchCamera").addEventListener("click",switchCamera);
$("saveRecord").addEventListener("click",updateCurrentRecord);$("clearForm").addEventListener("click",clearForm);
$("downloadExcel").addEventListener("click",exportExcel);$("downloadClear").addEventListener("click",downloadAndClear);
$("mfgDate").addEventListener("input",e=>{let v=e.target.value.replace(/[^\d]/g,"").slice(0,6);if(v.length>2)v=v.slice(0,2)+"/"+v.slice(2);e.target.value=v});
window.addEventListener("beforeunload",stopCamera);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
})();
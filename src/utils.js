function HTMLEncode(html) {
  var temp = document.createElement("div");
  temp.textContent != null
    ? (temp.textContent = html)
    : (temp.innerText = html);
  var output = temp.innerHTML;
  temp = null;
  return output;
}

export function processSvg(xml, data, cb) {
  const content = HTMLEncode(xml);
  data = data.split(",")[1];
  data = atob(data);
  const binaryArr = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    binaryArr[i] = data.charCodeAt(i);
  }
  const blob = new Blob([binaryArr], { type: "image/svg+xml" });
  const reader = new FileReader();
  reader.readAsText(blob);
  reader.onload = () => {
    const txt = reader.result;
    if (typeof cb === "function")
      cb(txt.replace("<svg ", `<svg content='${content}' `));
  };
}

function parse(search) {
  let obj = {};
  (search || "").replace(
    /([^?&=/]+)=([^?&=/]*)/g,
    (res, $1, $2) => (obj[decodeURIComponent($1)] = decodeURIComponent($2))
  );
  return obj;
}

export function getKey(url, key) {
  const obj = parse(url.split("?")[1]);
  return obj[key];
}

export const visibleStyle =
  "position:fixed;height:100%;width:100%;top:0;left:0;z-index:99990;background:white;";
export const hiddenStyle =
  "position:fixed;height:100%;width:100%;top:-10240px;left:0;z-index:99990;background:white;";

export const queryStr = "embed=1&ui=atlas&spin=1&proto=json&lang=zh";

export class ItvCheck {
  savingSto = null;

  isSaving = false;

  setSavingFlag() {
    this.clearSavingFlag();
    this.isSaving = true;
    this.savingSto = setTimeout(() => {
      this.isSaving = false;
    }, 5000);
  }

  clearSavingFlag() {
    this.isSaving = false;
    clearTimeout(this.savingSto);
  }

  checkReady(cb) {
    const maxtime = 100;
    let cnt = 0;
    const delay = 50;
    const int = setInterval(() => {
      cnt++;
      if (cnt > maxtime || !this.isSaving) {
        clearInterval(int);
        cb();
      }
    }, delay);
  }
}

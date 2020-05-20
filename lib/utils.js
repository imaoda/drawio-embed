"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processSvg = processSvg;
exports.getKey = getKey;
exports.ItvCheck = exports.queryStr = exports.hiddenStyle = exports.visibleStyle = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function HTMLEncode(html) {
  var temp = document.createElement("div");
  temp.textContent != null ? temp.textContent = html : temp.innerText = html;
  var output = temp.innerHTML;
  temp = null;
  return output;
}

function processSvg(xml, data, cb) {
  var content = HTMLEncode(xml);
  data = data.split(",")[1];
  data = atob(data);
  var binaryArr = new Uint8Array(data.length);

  for (var i = 0; i < data.length; i++) {
    binaryArr[i] = data.charCodeAt(i);
  }

  var blob = new Blob([binaryArr], {
    type: "image/svg+xml"
  });
  var reader = new FileReader();
  reader.readAsText(blob);

  reader.onload = function () {
    var txt = reader.result;
    if (typeof cb === "function") cb(txt.replace("<svg ", "<svg content='".concat(content, "' ")));
  };
}

function parse(search) {
  var obj = {};
  (search || "").replace(/([^?&=/]+)=([^?&=/]*)/g, function (res, $1, $2) {
    return obj[decodeURIComponent($1)] = decodeURIComponent($2);
  });
  return obj;
}

function getKey(url, key) {
  var obj = parse(url.split("?")[1]);
  return obj[key];
}

var visibleStyle = "position:fixed;height:100%;width:100%;top:0;left:0;z-index:99990;background:white;";
exports.visibleStyle = visibleStyle;
var hiddenStyle = "position:fixed;height:100%;width:100%;top:-10240px;left:0;z-index:99990;background:white;";
exports.hiddenStyle = hiddenStyle;
var queryStr = "embed=1&ui=atlas&spin=1&proto=json&lang=zh";
exports.queryStr = queryStr;

var ItvCheck = /*#__PURE__*/function () {
  function ItvCheck() {
    _classCallCheck(this, ItvCheck);

    this.savingSto = null;
    this.isSaving = false;
  }

  _createClass(ItvCheck, [{
    key: "setSavingFlag",
    value: function setSavingFlag() {
      var _this = this;

      this.clearSavingFlag();
      this.isSaving = true;
      this.savingSto = setTimeout(function () {
        _this.isSaving = false;
      }, 5000);
    }
  }, {
    key: "clearSavingFlag",
    value: function clearSavingFlag() {
      this.isSaving = false;
      clearTimeout(this.savingSto);
    }
  }, {
    key: "checkReady",
    value: function checkReady(cb) {
      var _this2 = this;

      var maxtime = 100;
      var cnt = 0;
      var delay = 50;
      var int = setInterval(function () {
        cnt++;

        if (cnt > maxtime || !_this2.isSaving) {
          clearInterval(int);
          cb();
        }
      }, delay);
    }
  }]);

  return ItvCheck;
}();

exports.ItvCheck = ItvCheck;
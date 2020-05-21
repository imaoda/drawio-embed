"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var DrawioEmbed = /*#__PURE__*/function (_ItvCheck) {
  _inherits(DrawioEmbed, _ItvCheck);

  var _super = _createSuper(DrawioEmbed);

  function DrawioEmbed() {
    var _this;

    _classCallCheck(this, DrawioEmbed);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.drawioIframe = null;
    _this.isIframeVisible = false;
    _this.closeHolding = false;
    _this.initialized = false;
    _this.drawioFrameLoaded = false;
    _this.eventListenerBound = false;
    _this.iframeInserted = false;
    _this.drawioUrl = "";

    _this.closeIframe = function () {
      var evc = new Event("drawioClosed");
      window.dispatchEvent(evc);

      _this.hideIframe();
    };

    _this.isOpen = function () {
      return _this.isIframeVisible;
    };

    _this.isLoaded = function () {
      return _this.initialized;
    };

    _this.editImage = function (url) {
      if (!_this.drawioFrameLoaded) return Promise.reject();

      if (!url) {
        _this.sendMsgToDrawio({
          action: "load"
        });

        _this.showIframe();

        return;
      }

      if (url.indexOf("<svg") === 0) {
        _this.sendMsgToDrawio({
          action: "load",
          xml: url
        });

        _this.showIframe();

        return;
      }

      _this.showIframe();

      _this.sendMsgToDrawio({
        action: "spinner",
        message: "加载中...",
        show: true,
        enabled: false
      });

      fetch(url).then(function (i) {
        return i.text();
      }).then(function (xml) {
        _this.sendMsgToDrawio({
          action: "spinner",
          message: "",
          show: false,
          enabled: true
        });

        setTimeout(function () {
          _this.sendMsgToDrawio({
            action: "load",
            xml: xml
          });
        }, 50);
      }).catch(function () {
        _this.sendMsgToDrawio({
          action: "spinner",
          message: "流程图加载失败",
          show: true,
          enabled: false
        });
      });
    };

    _this.init = function (drawioUrl) {
      _this.editImage.close = _this.closeIframe;
      _this.editImage.isOpen = _this.isOpen;
      _this.editImage.isLoaded = _this.isLoaded;
      if (_this.iframeInserted) return _this.editImage;
      _this.iframeInserted = true;
      if (!drawioUrl) drawioUrl = "https://www.draw.io/";

      _this.initCommunication(drawioUrl);

      return _this.editImage;
    };

    return _this;
  }

  _createClass(DrawioEmbed, [{
    key: "sendMsgToDrawio",
    value: function sendMsgToDrawio(obj) {
      var iframe = this.getFrame();
      iframe.contentWindow.postMessage(JSON.stringify(obj), "*");
    }
  }, {
    key: "showIframe",
    value: function showIframe() {
      var iframe = this.getFrame();
      iframe.setAttribute("style", _utils.visibleStyle);
      this.isIframeVisible = true;
    }
  }, {
    key: "hideIframe",
    value: function hideIframe() {
      var _this2 = this;

      var iframe = this.getFrame();
      iframe.setAttribute("style", _utils.hiddenStyle);
      this.isIframeVisible = false; // 清空编辑区

      setTimeout(function () {
        _this2.sendMsgToDrawio({
          action: "load"
        });
      }, 500); // 清空loading

      setTimeout(function () {
        _this2.sendMsgToDrawio({
          action: "spinner",
          message: "",
          show: false,
          enabled: true
        });
      }, 300);
    }
  }, {
    key: "getFrame",
    value: function getFrame() {
      if (!this.drawioIframe) {
        this.drawioIframe = document.createElement("iframe");
        this.drawioIframe.id = "drawio-iframe";
      }

      return this.drawioIframe;
    }
  }, {
    key: "initCommunication",
    value: function initCommunication(drawioUrl) {
      this.drawioUrl = drawioUrl;
      this.closeHolding = !!(0, _utils.getKey)(drawioUrl, "hold");
      if (this.initialized) return;
      this.initialized = true;
      if (drawioUrl.indexOf("?") !== -1) drawioUrl += "&".concat(_utils.queryStr);else drawioUrl += "?".concat(_utils.queryStr);
      var iframe = this.getFrame();
      iframe.src = drawioUrl;
      this.hideIframe();
      document.documentElement.appendChild(iframe);
      this.bindEventListener();
    }
  }, {
    key: "bindEventListener",
    value: function bindEventListener() {
      var _this3 = this;

      if (this.eventListenerBound) return;
      this.eventListenerBound = true;
      window.addEventListener("message", function (e) {
        if (!e.data) return;
        var msg = null;

        try {
          msg = JSON.parse(e.data);
        } catch (error) {}

        if (!msg || _typeof(msg) !== "object") return;
        var _msg = msg,
            event = _msg.event;

        switch (event) {
          case "init":
            _this3.drawioFrameLoaded = true;
            window.dispatchEvent(new Event("drawioLoaded"));
            break;

          case "save":
            _this3.sendMsgToDrawio({
              action: "export",
              format: "png",
              spinKey: "saving"
            });

            _this3.setSavingFlag();

            _this3.checkReady(function () {
              _this3.sendMsgToDrawio({
                action: "export",
                format: "svg",
                spinKey: "saving"
              });
            });

            if (_this3.closeHolding) {
              _this3.sendMsgToDrawio({
                action: "spinner",
                message: "保存中...",
                show: true,
                enabled: false
              });
            } else _this3.hideIframe();

            break;

          case "export":
            if (!msg.data) return;

            _this3.clearSavingFlag();

            if (msg.data.indexOf("data:image/png") !== -1) {
              var ev = new Event("drawioImageCreated");
              ev.imageType = "png";
              ev.imageContent = msg.data;
              window.dispatchEvent(ev);
            } else {
              (0, _utils.processSvg)(msg.xml, msg.data, function (img) {
                var ev = new Event("drawioImageCreated");
                ev.imageType = "svg";
                ev.imageContent = img;
                ev.xml = msg.xml; // 用于导出恢复

                window.dispatchEvent(ev);
              });
            }

            break;

          case "exit":
            _this3.closeIframe();

            break;

          default:
            break;
        }
      });
    }
  }]);

  return DrawioEmbed;
}(_utils.ItvCheck);

var _default = new DrawioEmbed().init;
exports.default = _default;
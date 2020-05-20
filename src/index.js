import {
  processSvg,
  visibleStyle,
  hiddenStyle,
  queryStr,
  ItvCheck,
  getKey
} from "./utils";

class DrawioEmbed extends ItvCheck {
  drawioIframe = null;

  isIframeVisible = false;

  closeHolding = false;

  initialized = false;

  drawioFrameLoaded = false;

  eventListenerBound = false;

  iframeInserted = false;

  drawioUrl = "";

  sendMsgToDrawio(obj) {
    const iframe = this.getFrame();
    iframe.contentWindow.postMessage(JSON.stringify(obj), "*");
  }

  showIframe() {
    const iframe = this.getFrame();
    iframe.setAttribute("style", visibleStyle);
    this.isIframeVisible = true;
  }

  hideIframe() {
    const iframe = this.getFrame();
    iframe.setAttribute("style", hiddenStyle);
    this.isIframeVisible = false;

    // 清空编辑区
    setTimeout(() => {
      this.sendMsgToDrawio({
        action: "load"
      });
    }, 500);

    // 清空loading
    setTimeout(() => {
      this.sendMsgToDrawio({
        action: "spinner",
        message: "",
        show: false,
        enabled: true
      });
    }, 300);
  }

  closeIframe = () => {
    const evc = new Event("drawioClosed");
    window.dispatchEvent(evc);
    this.hideIframe();
  };

  isOpen = () => {
    return this.isIframeVisible;
  };

  isLoaded = () => {
    return this.initialized;
  };

  editImage = url => {
    if (!this.drawioFrameLoaded) return Promise.reject();
    if (!url) {
      this.sendMsgToDrawio({
        action: "load"
      });
      this.showIframe();
      return;
    }
    if (url.indexOf("<svg") === 0) {
      this.sendMsgToDrawio({
        action: "load",
        xml: url
      });
      this.showIframe();
      return;
    }
    this.showIframe();
    this.sendMsgToDrawio({
      action: "spinner",
      message: "加载中...",
      show: true,
      enabled: false
    });

    fetch(url)
      .then(i => i.text())
      .then(xml => {
        this.sendMsgToDrawio({
          action: "spinner",
          message: "",
          show: false,
          enabled: true
        });
        setTimeout(() => {
          this.sendMsgToDrawio({
            action: "load",
            xml
          });
        }, 50);
      })
      .catch(() => {
        this.sendMsgToDrawio({
          action: "spinner",
          message: "流程图加载失败",
          show: true,
          enabled: false
        });
      });
  };

  getFrame() {
    if (!this.drawioIframe) {
      this.drawioIframe = document.createElement("iframe");
      this.drawioIframe.id = "drawio-iframe";
    }
    return this.drawioIframe;
  }

  init = drawioUrl => {
    this.editImage.close = this.closeIframe;
    this.editImage.isOpen = this.isOpen;
    this.editImage.isLoaded = this.isLoaded;
    if (this.iframeInserted) return this.editImage;
    this.iframeInserted = true;
    if (!drawioUrl) drawioUrl = "https://www.draw.io/";
    this.initCommunication(drawioUrl);
    return this.editImage;
  };

  initCommunication(drawioUrl) {
    this.drawioUrl = drawioUrl;
    this.closeHolding = !!getKey(drawioUrl, "hold");
    if (this.initialized) return;
    this.initialized = true;
    if (drawioUrl.indexOf("?") !== -1) drawioUrl += `&${queryStr}`;
    else drawioUrl += `?${queryStr}`;
    const iframe = this.getFrame();
    iframe.src = drawioUrl;
    this.hideIframe();
    document.documentElement.appendChild(iframe);
    this.bindEventListener();
  }

  bindEventListener() {
    if (this.eventListenerBound) return;
    this.eventListenerBound = true;
    window.addEventListener("message", e => {
      if (!e.data) return;
      let msg = null;
      try {
        msg = JSON.parse(e.data);
      } catch (error) {}
      if (!msg || typeof msg !== "object") return;
      const { event } = msg;
      switch (event) {
        case "init":
          this.drawioFrameLoaded = true;
          window.dispatchEvent(new Event("drawioLoaded"));
          break;
        case "save":
          this.sendMsgToDrawio({
            action: "export",
            format: "png",
            spinKey: "saving"
          });
          this.setSavingFlag();
          this.checkReady(() => {
            this.sendMsgToDrawio({
              action: "export",
              format: "svg",
              spinKey: "saving"
            });
          });
          if (this.closeHolding) {
            this.sendMsgToDrawio({
              action: "spinner",
              message: "保存中...",
              show: true,
              enabled: false
            });
          } else this.hideIframe();
          break;
        case "export":
          if (!msg.data) return;
          this.clearSavingFlag();
          if (msg.data.indexOf("data:image/png") !== -1) {
            const ev = new Event("drawioImageCreated");
            ev.imageType = "png";
            ev.imageContent = msg.data;
            window.dispatchEvent(ev);
          } else {
            processSvg(msg.xml, msg.data, img => {
              const ev = new Event("drawioImageCreated");
              ev.imageType = "svg";
              ev.imageContent = img;
              ev.xml = msg.xml; // 用于导出恢复
              window.dispatchEvent(ev);
            });
          }
          break;

        case "exit":
          this.closeIframe();
          break;

        default:
          break;
      }
    });
  }
}

export default new DrawioEmbed().init;

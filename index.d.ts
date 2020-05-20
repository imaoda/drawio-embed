declare namespace openDrawio {
  const close: () => void;
  const isOpen: () => boolean;
}
declare function openDrawio(): Promise<void>;

declare function init(url?: string): typeof openDrawio;

export default init;

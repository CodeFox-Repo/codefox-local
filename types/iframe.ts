/**
 * iframe 状态
 */
export interface IframeState {
  url: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * iframe 控制接口
 */
export interface IframeControls {
  setUrl: (url: string) => void;
  reload: () => void;
  goBack?: () => void;
  goForward?: () => void;
}

interface LoadingState {
  [key: string]: boolean
}

class LoadingManager {
  private loadingStates: LoadingState = {}
  private callbacks: { [key: string]: (loading: boolean) => void } = {}

  // 设置loading状态
  setLoading(key: string, loading: boolean) {
    this.loadingStates[key] = loading
    if (this.callbacks[key]) {
      this.callbacks[key](loading)
    }
  }

  // 获取loading状态
  getLoading(key: string): boolean {
    return this.loadingStates[key] || false
  }

  // 注册loading状态变化回调
  onLoadingChange(key: string, callback: (loading: boolean) => void) {
    this.callbacks[key] = callback
  }

  // 批量设置loading状态
  setBatchLoading(states: LoadingState) {
    Object.keys(states).forEach(key => {
      this.setLoading(key, states[key])
    })
  }

  // 清理loading状态
  clearLoading(key?: string) {
    if (key) {
      delete this.loadingStates[key]
      delete this.callbacks[key]
    } else {
      this.loadingStates = {}
      this.callbacks = {}
    }
  }
}

export const loadingManager = new LoadingManager()
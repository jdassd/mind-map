import { storeLocalConfig } from '@/api'

const app = {
  // 不加 namespaced，保持与现有组件兼容
  state: {
    isHandleLocalFile: false,
    localConfig: {
      isZenMode: false,
      openNodeRichText: true,
      useLeftKeySelectionRightKeyDrag: false,
      isShowScrollbar: false,
      isDark: false,
      enableAi: true
    },
    activeSidebar: '',
    isOutlineEdit: false,
    isReadonly: false,
    isSourceCodeEdit: false,
    extraTextOnExport: '',
    isDragOutlineTreeNode: false,
    aiConfig: {
      api: 'http://ark.cn-beijing.volces.com/api/v3/chat/completions',
      key: '',
      model: '',
      port: 3456,
      method: 'POST'
    },
    extendThemeGroupList: [],
    bgList: []
  },
  mutations: {
    setIsHandleLocalFile(state, data) {
      state.isHandleLocalFile = data
    },
    setLocalConfig(state, data) {
      const aiConfigKeys = Object.keys(state.aiConfig)
      Object.keys(data).forEach(key => {
        if (aiConfigKeys.includes(key)) {
          state.aiConfig[key] = data[key]
        } else {
          state.localConfig[key] = data[key]
        }
      })
      storeLocalConfig({
        ...state.localConfig,
        ...state.aiConfig
      })
    },
    setActiveSidebar(state, data) {
      state.activeSidebar = data
    },
    setIsOutlineEdit(state, data) {
      state.isOutlineEdit = data
    },
    setIsReadonly(state, data) {
      state.isReadonly = data
    },
    setIsSourceCodeEdit(state, data) {
      state.isSourceCodeEdit = data
    },
    setExtraTextOnExport(state, data) {
      state.extraTextOnExport = data
    },
    setIsDragOutlineTreeNode(state, data) {
      state.isDragOutlineTreeNode = data
    },
    setExtendThemeGroupList(state, data) {
      state.extendThemeGroupList = data
    },
    setBgList(state, data) {
      state.bgList = data
    }
  },
  actions: {}
}

export default app

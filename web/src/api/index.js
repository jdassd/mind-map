import exampleData from 'simple-mind-map/example/exampleData'
import { simpleDeepClone } from 'simple-mind-map/src/utils/index'
import Vue from 'vue'
import vuexStore from '@/store'
import { getMindMap, updateMindMap } from '@/api/mindmaps'

const SIMPLE_MIND_MAP_DATA = 'SIMPLE_MIND_MAP_DATA'
const SIMPLE_MIND_MAP_CONFIG = 'SIMPLE_MIND_MAP_CONFIG'
const SIMPLE_MIND_MAP_LANG = 'SIMPLE_MIND_MAP_LANG'
const SIMPLE_MIND_MAP_LOCAL_CONFIG = 'SIMPLE_MIND_MAP_LOCAL_CONFIG'

let mindMapData = null
let currentMindMapId = null
let saveTimer = null

// 获取默认的思维导图数据结构
export const getDefaultMindMapData = () => {
  return {
    root: {
      data: {
        text: '根节点'
      },
      children: []
    },
    theme: {
      template: 'classic4',
      config: {}
    },
    layout: 'logicalStructure'
  }
}

// 确保思维导图数据结构完整
const ensureCompleteData = data => {
  if (!data || typeof data !== 'object') {
    return simpleDeepClone(exampleData)
  }
  const defaults = getDefaultMindMapData()
  if (!data.root) {
    data.root = defaults.root
  }
  if (!data.theme) {
    data.theme = defaults.theme
  }
  if (!data.layout) {
    data.layout = defaults.layout
  }
  return data
}

// 获取缓存的思维导图数据
export const getData = () => {
  // 接管模式
  if (window.takeOverApp) {
    mindMapData = window.takeOverAppMethods.getMindMapData()
    return mindMapData
  }
  // 操作本地文件模式
  if (vuexStore.state.isHandleLocalFile) {
    return Vue.prototype.getCurrentData()
  }
  let store = localStorage.getItem(SIMPLE_MIND_MAP_DATA)
  if (store === null) {
    return simpleDeepClone(exampleData)
  } else {
    try {
      return ensureCompleteData(JSON.parse(store))
    } catch (error) {
      return simpleDeepClone(exampleData)
    }
  }
}

// 存储思维导图数据
export const storeData = data => {
  try {
    let originData = null
    if (window.takeOverApp) {
      originData = mindMapData
    } else {
      originData = getData()
    }
    if (!originData) {
      originData = {}
    }
    originData = {
      ...originData,
      ...data
    }
    if (window.takeOverApp) {
      mindMapData = originData
      window.takeOverAppMethods.saveMindMapData(originData)
      return
    }
    Vue.prototype.$bus.$emit('write_local_file', originData)
    if (vuexStore.state.isHandleLocalFile) {
      return
    }
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, JSON.stringify(originData))
    // 防抖保存到服务端
    debounceSaveToServer(originData)
  } catch (error) {
    console.log(error)
    if ('exceeded') {
      Vue.prototype.$bus.$emit('localStorageExceeded')
    }
  }
}

// 防抖保存到服务端
const debounceSaveToServer = data => {
  if (window.takeOverApp || !currentMindMapId) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    updateMindMap(currentMindMapId, {
      data: data,
      title: data.root && data.root.data ? data.root.data.text || 'Untitled' : 'Untitled'
    }).catch(err => {
      console.log('Auto save failed:', err)
    })
  }, 2000)
}

// 从服务端加载思维导图
export const loadMindMapFromServer = async id => {
  if (window.takeOverApp) return null
  currentMindMapId = id
  try {
    const { data } = await getMindMap(id)
    return data
  } catch (error) {
    console.log('Failed to load mind map from server:', error)
    return null
  }
}

// 设置当前导图ID（供路由切换使用）
export const setCurrentMindMapId = id => {
  currentMindMapId = id
}

// 获取当前导图ID
export const getCurrentMindMapId = () => {
  return currentMindMapId
}

// 获取思维导图配置数据
export const getConfig = () => {
  if (window.takeOverApp) {
    window.takeOverAppMethods.getMindMapConfig()
    return
  }
  let config = localStorage.getItem(SIMPLE_MIND_MAP_CONFIG)
  if (config) {
    return JSON.parse(config)
  }
  return null
}

// 存储思维导图配置数据
export const storeConfig = config => {
  try {
    if (window.takeOverApp) {
      window.takeOverAppMethods.saveMindMapConfig(config)
      return
    }
    localStorage.setItem(SIMPLE_MIND_MAP_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.log(error)
  }
}

// 存储语言
export const storeLang = lang => {
  if (window.takeOverApp) {
    window.takeOverAppMethods.saveLanguage(lang)
    return
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LANG, lang)
}

// 获取存储的语言
export const getLang = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLanguage() || 'zh'
  }
  let lang = localStorage.getItem(SIMPLE_MIND_MAP_LANG)
  if (lang) {
    return lang
  }
  storeLang('zh')
  return 'zh'
}

// 存储本地配置
export const storeLocalConfig = config => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.saveLocalConfig(config)
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LOCAL_CONFIG, JSON.stringify(config))
}

// 获取本地配置
export const getLocalConfig = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLocalConfig()
  }
  let config = localStorage.getItem(SIMPLE_MIND_MAP_LOCAL_CONFIG)
  if (config) {
    return JSON.parse(config)
  }
  return null
}

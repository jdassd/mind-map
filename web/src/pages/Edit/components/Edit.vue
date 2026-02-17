<template>
  <div
    class="editContainer"
    @dragenter.stop.prevent="onDragenter"
    @dragleave.stop.prevent
    @dragover.stop.prevent
    @drop.stop.prevent
  >
    <div
      class="mindMapContainer"
      id="mindMapContainer"
      ref="mindMapContainer"
    ></div>
    <Count :mindMap="mindMap" v-if="!isZenMode"></Count>
    <Navigator v-if="mindMap" :mindMap="mindMap"></Navigator>
    <NavigatorToolbar :mindMap="mindMap" v-if="!isZenMode"></NavigatorToolbar>
    <OutlineSidebar :mindMap="mindMap"></OutlineSidebar>
    <Style v-if="mindMap && !isZenMode" :mindMap="mindMap"></Style>
    <BaseStyle
      :data="mindMapData"
      :configData="mindMapConfig"
      :mindMap="mindMap"
    ></BaseStyle>
    <AssociativeLineStyle
      v-if="mindMap"
      :mindMap="mindMap"
    ></AssociativeLineStyle>
    <Theme v-if="mindMap" :data="mindMapData" :mindMap="mindMap"></Theme>
    <Structure :mindMap="mindMap"></Structure>
    <ShortcutKey></ShortcutKey>
    <Contextmenu v-if="mindMap" :mindMap="mindMap"></Contextmenu>
    <RichTextToolbar v-if="mindMap" :mindMap="mindMap"></RichTextToolbar>
    <NodeNoteContentShow
      v-if="mindMap"
      :mindMap="mindMap"
    ></NodeNoteContentShow>
    <NodeImgPreview v-if="mindMap" :mindMap="mindMap"></NodeImgPreview>
    <SidebarTrigger v-if="!isZenMode"></SidebarTrigger>
    <Search v-if="mindMap" :mindMap="mindMap"></Search>
    <NodeIconSidebar v-if="mindMap" :mindMap="mindMap"></NodeIconSidebar>
    <NodeIconToolbar v-if="mindMap" :mindMap="mindMap"></NodeIconToolbar>
    <OutlineEdit v-if="mindMap" :mindMap="mindMap"></OutlineEdit>
    <Scrollbar v-if="isShowScrollbar && mindMap" :mindMap="mindMap"></Scrollbar>
    <FormulaSidebar v-if="mindMap" :mindMap="mindMap"></FormulaSidebar>
    <NodeOuterFrame v-if="mindMap" :mindMap="mindMap"></NodeOuterFrame>
    <NodeTagStyle v-if="mindMap" :mindMap="mindMap"></NodeTagStyle>
    <Setting :configData="mindMapConfig" :mindMap="mindMap"></Setting>
    <NodeImgPlacementToolbar
      v-if="mindMap"
      :mindMap="mindMap"
    ></NodeImgPlacementToolbar>
    <NodeNoteSidebar v-if="mindMap" :mindMap="mindMap"></NodeNoteSidebar>
    <AiCreate v-if="mindMap && enableAi" :mindMap="mindMap"></AiCreate>
    <AiChat v-if="enableAi"></AiChat>
    <div
      class="dragMask"
      v-if="showDragMask"
      @dragleave.stop.prevent="onDragleave"
      @dragover.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <div class="dragTip">{{ $t('edit.dragTip') }}</div>
    </div>
    <!-- 节点编辑历史状态栏 -->
    <div class="nodeEditStatusBar" v-if="activeNodeHistory">
      <span>最后编辑：{{ activeNodeHistory.user_display_name }}，{{ formatTime(activeNodeHistory.edited_at) }}</span>
    </div>
  </div>
</template>

<script>
import MindMap from 'simple-mind-map'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import NodeBase64ImageStorage from 'simple-mind-map/src/plugins/NodeBase64ImageStorage.js'
import Themes from 'simple-mind-map-plugin-themes'
// 协同编辑插件
// import Cooperate from 'simple-mind-map/src/plugins/Cooperate.js'
import OutlineSidebar from './OutlineSidebar.vue'
import Style from './Style.vue'
import BaseStyle from './BaseStyle.vue'
import Theme from './Theme.vue'
import Structure from './Structure.vue'
import Count from './Count.vue'
import NavigatorToolbar from './NavigatorToolbar.vue'
import ShortcutKey from './ShortcutKey.vue'
import Contextmenu from './Contextmenu.vue'
import RichTextToolbar from './RichTextToolbar.vue'
import NodeNoteContentShow from './NodeNoteContentShow.vue'
import { getData, getConfig, storeData } from '@/api'
import { getCurrentMindMapId } from '@/api'
import { getNodeHistory, saveNodeHistory, getNodeLocks, lockNode, unlockNode, refreshNodeLock } from '@/api/mindmaps'
import Navigator from './Navigator.vue'
import NodeImgPreview from './NodeImgPreview.vue'
import SidebarTrigger from './SidebarTrigger.vue'
import { mapState } from 'vuex'
import icon from '@/config/icon'
import Vue from 'vue'
import Search from './Search.vue'
import NodeIconSidebar from './NodeIconSidebar.vue'
import NodeIconToolbar from './NodeIconToolbar.vue'
import OutlineEdit from './OutlineEdit.vue'
import { showLoading, hideLoading } from '@/utils/loading'
import handleClipboardText from '@/utils/handleClipboardText'
import { getParentWithClass } from '@/utils'
import Scrollbar from './Scrollbar.vue'
import exampleData from 'simple-mind-map/example/exampleData'
import FormulaSidebar from './FormulaSidebar.vue'
import NodeOuterFrame from './NodeOuterFrame.vue'
import NodeTagStyle from './NodeTagStyle.vue'
import Setting from './Setting.vue'
import AssociativeLineStyle from './AssociativeLineStyle.vue'
import NodeImgPlacementToolbar from './NodeImgPlacementToolbar.vue'
import NodeNoteSidebar from './NodeNoteSidebar.vue'
import AiCreate from './AiCreate.vue'
import AiChat from './AiChat.vue'

// 注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  .usePlugin(NodeBase64ImageStorage)
// .usePlugin(Cooperate) // 协同插件

// 注册主题
Themes.init(MindMap)
// 扩展主题列表
if (typeof MoreThemes !== 'undefined') {
  MoreThemes.init(MindMap)
}

export default {
  components: {
    OutlineSidebar,
    Style,
    BaseStyle,
    Theme,
    Structure,
    Count,
    NavigatorToolbar,
    ShortcutKey,
    Contextmenu,
    RichTextToolbar,
    NodeNoteContentShow,
    Navigator,
    NodeImgPreview,
    SidebarTrigger,
    Search,
    NodeIconSidebar,
    NodeIconToolbar,
    OutlineEdit,
    Scrollbar,
    FormulaSidebar,
    NodeOuterFrame,
    NodeTagStyle,
    Setting,
    AssociativeLineStyle,
    NodeImgPlacementToolbar,
    NodeNoteSidebar,
    AiCreate,
    AiChat
  },
  data() {
    return {
      enableShowLoading: true,
      mindMap: null,
      mindMapData: null,
      mindMapConfig: {},
      prevImg: '',
      storeConfigTimer: null,
      showDragMask: false,
      // 节点锁定相关
      lockedNodes: {},         // { nodeUid: { user_id, display_name } }
      editingNodeUid: null,    // 当前正在编辑的节点uid
      lockGranted: false,      // 锁定已授权标记，防止 beforeTextEdit 循环
      lockLabelElements: {},   // SVG lock label elements
      lockPollTimer: null,     // 轮询锁定状态定时器
      lockRefreshTimer: null,  // 刷新自己锁定的TTL定时器
      // 编辑历史
      nodeHistoryMap: {},      // { nodeUid: historyRecord }
      activeNodeHistory: null  // 当前选中节点的编辑历史
    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      openNodeRichText: state => state.localConfig.openNodeRichText,
      isShowScrollbar: state => state.localConfig.isShowScrollbar,
      enableDragImport: state => state.localConfig.enableDragImport,
      useLeftKeySelectionRightKeyDrag: state =>
        state.localConfig.useLeftKeySelectionRightKeyDrag,
      extraTextOnExport: state => state.extraTextOnExport,
      isDragOutlineTreeNode: state => state.isDragOutlineTreeNode,
      enableAi: state => state.localConfig.enableAi
    })
  },
  watch: {
    openNodeRichText() {
      if (this.openNodeRichText) {
        this.addRichTextPlugin()
      } else {
        this.removeRichTextPlugin()
      }
    },
    isShowScrollbar() {
      if (this.isShowScrollbar) {
        this.addScrollbarPlugin()
      } else {
        this.removeScrollbarPlugin()
      }
    }
  },
  mounted() {
    showLoading()
    this.getData()
    this.init()
    this.$bus.$on('execCommand', this.execCommand)
    this.$bus.$on('paddingChange', this.onPaddingChange)
    this.$bus.$on('export', this.export)
    this.$bus.$on('setData', this.setData)
    this.$bus.$on('startTextEdit', this.handleStartTextEdit)
    this.$bus.$on('endTextEdit', this.handleEndTextEdit)
    this.$bus.$on('createAssociativeLine', this.handleCreateLineFromActiveNode)
    this.$bus.$on('startPainter', this.handleStartPainter)
    this.$bus.$on('node_tree_render_end', this.handleHideLoading)
    this.$bus.$on('showLoading', this.handleShowLoading)
    this.$bus.$on('localStorageExceeded', this.onLocalStorageExceeded)
    window.addEventListener('resize', this.handleResize)
    this.$bus.$on('showDownloadTip', this.showDownloadTip)
    // 节点锁定和编辑历史
    this.initLockPolling()
    this.loadNodeHistory()
    this.$bus.$on('node_active', this.handleNodeActive)
  },
  beforeDestroy() {
    this.$bus.$off('execCommand', this.execCommand)
    this.$bus.$off('paddingChange', this.onPaddingChange)
    this.$bus.$off('export', this.export)
    this.$bus.$off('setData', this.setData)
    this.$bus.$off('startTextEdit', this.handleStartTextEdit)
    this.$bus.$off('endTextEdit', this.handleEndTextEdit)
    this.$bus.$off('createAssociativeLine', this.handleCreateLineFromActiveNode)
    this.$bus.$off('startPainter', this.handleStartPainter)
    this.$bus.$off('node_tree_render_end', this.handleHideLoading)
    this.$bus.$off('showLoading', this.handleShowLoading)
    this.$bus.$off('localStorageExceeded', this.onLocalStorageExceeded)
    window.removeEventListener('resize', this.handleResize)
    this.$bus.$off('showDownloadTip', this.showDownloadTip)
    this.$bus.$off('node_active', this.handleNodeActive)
    // 清理轮询定时器和锁定标签
    this.stopLockPolling()
    this.releaseCurrentLock()
    this.clearAllLockLabels()
    this.mindMap.destroy()
  },
  methods: {
    onLocalStorageExceeded() {
      this.$notify({
        type: 'warning',
        title: this.$t('edit.tip'),
        message: this.$t('edit.localStorageExceededTip'),
        duration: 0
      })
    },

    handleStartTextEdit() {
      this.mindMap.renderer.startTextEdit()
    },

    handleCreateLineFromActiveNode() {
      this.mindMap.associativeLine.createLineFromActiveNode()
    },

    handleStartPainter() {
      this.mindMap.painter.startPainter()
    },

    handleResize() {
      this.mindMap.resize()
    },

    // 显示loading
    handleShowLoading() {
      this.enableShowLoading = true
      showLoading()
    },

    // 渲染结束后关闭loading
    handleHideLoading() {
      if (this.enableShowLoading) {
        this.enableShowLoading = false
        hideLoading()
      }
      // 重新渲染锁定标签
      this.$nextTick(() => {
        this.updateAllLockLabels()
      })
    },

    // 获取思维导图数据，实际应该调接口获取
    getData() {
      this.mindMapData = getData()
      this.mindMapConfig = getConfig() || {}
    },

    // 存储数据当数据有变时
    bindSaveEvent() {
      this.$bus.$on('data_change', data => {
        storeData({ root: data })
      })
      this.$bus.$on('view_data_change', data => {
        clearTimeout(this.storeConfigTimer)
        this.storeConfigTimer = setTimeout(() => {
          storeData({
            view: data
          })
        }, 300)
      })
    },

    // 手动保存
    manualSave() {
      storeData(this.mindMap.getData(true))
    },

    // 初始化
    init() {
      let hasFileURL = this.hasFileURL()
      let { root, layout, theme, view } = this.mindMapData
      const config = this.mindMapConfig
      // 如果url中存在要打开的文件，那么思维导图数据、主题、布局都使用默认的
      if (hasFileURL) {
        root = {
          data: {
            text: this.$t('edit.root')
          },
          children: []
        }
        layout = exampleData.layout
        theme = exampleData.theme
        view = null
      }
      this.mindMap = new MindMap({
        el: this.$refs.mindMapContainer,
        data: root,
        fit: false,
        layout: layout,
        theme: theme.template,
        themeConfig: theme.config,
        viewData: view,
        nodeTextEditZIndex: 1000,
        nodeNoteTooltipZIndex: 1000,
        customNoteContentShow: {
          show: (content, left, top, node) => {
            this.$bus.$emit('showNoteContent', content, left, top, node)
          },
          hide: () => {
            // this.$bus.$emit('hideNoteContent')
          }
        },
        openRealtimeRenderOnNodeTextEdit: true,
        enableAutoEnterTextEditWhenKeydown: true,
        demonstrateConfig: {
          openBlankMode: false
        },
        ...(config || {}),
        iconList: [...icon],
        useLeftKeySelectionRightKeyDrag: this.useLeftKeySelectionRightKeyDrag,
        customInnerElsAppendTo: null,
        customHandleClipboardText: handleClipboardText,
        defaultNodeImage: require('../../../assets/img/图片加载失败.svg'),
        initRootNodePosition: ['center', 'center'],
        handleIsSplitByWrapOnPasteCreateNewNode: () => {
          return this.$confirm(
            this.$t('edit.splitByWrap'),
            this.$t('edit.tip'),
            {
              confirmButtonText: this.$t('edit.yes'),
              cancelButtonText: this.$t('edit.no'),
              type: 'warning'
            }
          )
        },
        errorHandler: (code, err) => {
          console.error(err)
          switch (code) {
            case 'export_error':
              this.$message.error(this.$t('edit.exportError'))
              break
            default:
              break
          }
        },
        addContentToFooter: () => {
          const text = this.extraTextOnExport.trim()
          if (!text) return null
          const el = document.createElement('div')
          el.className = 'footer'
          el.innerHTML = text
          const cssText = `
            .footer {
              width: 100%;
              height: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 12px;
              color: #979797;
            }
          `
          return {
            el,
            cssText,
            height: 30
          }
        },
        expandBtnNumHandler: num => {
          return num >= 100 ? '…' : num
        },
        beforeTextEdit: node => {
          return this.checkNodeLockBeforeEdit(node)
        },
        beforeDeleteNodeImg: node => {
          return new Promise(resolve => {
            this.$confirm(
              this.$t('edit.deleteNodeImgTip'),
              this.$t('edit.tip'),
              {
                confirmButtonText: this.$t('edit.yes'),
                cancelButtonText: this.$t('edit.no'),
                type: 'warning'
              }
            )
              .then(() => {
                resolve(false)
              })
              .catch(() => {
                resolve(true)
              })
          })
        }
      })
      this.loadPlugins()
      this.mindMap.keyCommand.addShortcut('Control+s', () => {
        this.manualSave()
      })
      // 转发事件
      ;[
        'node_active',
        'data_change',
        'view_data_change',
        'back_forward',
        'node_contextmenu',
        'node_click',
        'draw_click',
        'expand_btn_click',
        'svg_mousedown',
        'mouseup',
        'mode_change',
        'node_tree_render_end',
        'rich_text_selection_change',
        'transforming-dom-to-images',
        'generalization_node_contextmenu',
        'painter_start',
        'painter_end',
        'scrollbar_change',
        'scale',
        'translate',
        'node_attachmentClick',
        'node_attachmentContextmenu',
        'demonstrate_jump',
        'exit_demonstrate',
        'node_note_dblclick',
        'node_mousedown'
      ].forEach(event => {
        this.mindMap.on(event, (...args) => {
          this.$bus.$emit(event, ...args)
        })
      })
      this.bindSaveEvent()
      // 如果应用被接管，那么抛出事件传递思维导图实例
      if (window.takeOverApp) {
        this.$bus.$emit('app_inited', this.mindMap)
      }
      // 解析url中的文件
      if (hasFileURL) {
        this.$bus.$emit('handle_file_url')
      }
      // api/index.js文件使用
      // 当正在编辑本地文件时通过该方法获取最新数据
      Vue.prototype.getCurrentData = () => {
        const fullData = this.mindMap.getData(true)
        return { ...fullData }
      }
      // 协同测试
      this.cooperateTest()
    },

    // 加载相关插件
    loadPlugins() {
      if (this.openNodeRichText) this.addRichTextPlugin()
      if (this.isShowScrollbar) this.addScrollbarPlugin()
    },

    // url中是否存在要打开的文件
    hasFileURL() {
      const fileURL = this.$route.query.fileURL
      if (!fileURL) return false
      return /\.(smm|json|xmind|md|xlsx)$/.test(fileURL)
    },

    // 动态设置思维导图数据
    setData(data) {
      this.handleShowLoading()
      let rootNodeData = null
      if (data.root) {
        this.mindMap.setFullData(data)
        rootNodeData = data.root
      } else {
        this.mindMap.setData(data)
        rootNodeData = data
      }
      this.mindMap.view.reset()
      this.manualSave()
      // 如果导入的是富文本内容，那么自动开启富文本模式
      if (rootNodeData.data.richText && !this.openNodeRichText) {
        this.$bus.$emit('toggleOpenNodeRichText', true)
        this.$notify.info({
          title: this.$t('edit.tip'),
          message: this.$t('edit.autoOpenNodeRichTextTip')
        })
      }
    },

    // 重新渲染
    reRender() {
      this.mindMap.reRender()
    },

    // 执行命令
    execCommand(...args) {
      this.mindMap.execCommand(...args)
    },

    // 导出
    async export(...args) {
      try {
        showLoading()
        await this.mindMap.export(...args)
        hideLoading()
      } catch (error) {
        console.log(error)
        hideLoading()
      }
    },

    // 修改导出内边距
    onPaddingChange(data) {
      this.mindMap.updateConfig(data)
    },

    // 加载节点富文本编辑插件
    addRichTextPlugin() {
      if (!this.mindMap) return
      this.mindMap.addPlugin(RichText)
    },

    // 移除节点富文本编辑插件
    removeRichTextPlugin() {
      this.mindMap.removePlugin(RichText)
    },

    // 加载滚动条插件
    addScrollbarPlugin() {
      if (!this.mindMap) return
      this.mindMap.addPlugin(ScrollbarPlugin)
    },

    // 移除滚动条插件
    removeScrollbarPlugin() {
      this.mindMap.removePlugin(ScrollbarPlugin)
    },

    // 协同测试
    cooperateTest() {
      if (this.mindMap.cooperate && this.$route.query.userName) {
        this.mindMap.cooperate.setProvider(null, {
          roomName: 'demo-room',
          signalingList: ['ws://localhost:4444']
        })
        this.mindMap.cooperate.setUserInfo({
          id: Math.random(),
          name: this.$route.query.userName,
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][
            Math.floor(Math.random() * 5)
          ],
          avatar:
            Math.random() > 0.5
              ? 'https://img0.baidu.com/it/u=4270674549,2416627993&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1696006800&t=4d32871d14a7224a4591d0c3c7a97311'
              : ''
        })
      }
    },

    // 拖拽文件到页面导入
    onDragenter() {
      if (!this.enableDragImport || this.isDragOutlineTreeNode) return
      this.showDragMask = true
    },

    onDragleave() {
      this.showDragMask = false
    },

    onDrop(e) {
      if (!this.enableDragImport) return
      this.showDragMask = false
      const dt = e.dataTransfer
      const file = dt.files && dt.files[0]
      if (!file) return
      this.$bus.$emit('importFile', file)
    },

    // ============ 节点锁定与编辑历史 ============

    // 初始化锁定状态轮询
    initLockPolling() {
      const mindmapId = getCurrentMindMapId()
      if (!mindmapId || window.takeOverApp) return
      this.pollLocks()
      this.lockPollTimer = setInterval(() => {
        this.pollLocks()
      }, 3000)
    },

    // 停止轮询
    stopLockPolling() {
      if (this.lockPollTimer) {
        clearInterval(this.lockPollTimer)
        this.lockPollTimer = null
      }
      if (this.lockRefreshTimer) {
        clearInterval(this.lockRefreshTimer)
        this.lockRefreshTimer = null
      }
    },

    // 轮询获取锁定状态
    async pollLocks() {
      const mindmapId = getCurrentMindMapId()
      if (!mindmapId) return
      try {
        const { data } = await getNodeLocks(mindmapId)
        const newLocks = {}
        data.forEach(lock => {
          newLocks[lock.node_uid] = {
            user_id: lock.user_id,
            display_name: lock.display_name
          }
        })
        this.lockedNodes = newLocks
        this.updateAllLockLabels()
      } catch (e) {
        // ignore polling errors
      }
    },

    // 释放当前持有的锁
    releaseCurrentLock() {
      if (this.editingNodeUid) {
        const mindmapId = getCurrentMindMapId()
        if (mindmapId) {
          unlockNode(mindmapId, this.editingNodeUid).catch(() => {})
        }
        this.editingNodeUid = null
      }
      if (this.lockRefreshTimer) {
        clearInterval(this.lockRefreshTimer)
        this.lockRefreshTimer = null
      }
    },

    // 检查节点锁定状态（beforeTextEdit 回调）
    checkNodeLockBeforeEdit(node) {
      // 锁定已授权，直接放行并清除标记
      if (this.lockGranted) {
        this.lockGranted = false
        return true
      }

      if (!node) return true

      const mindmapId = getCurrentMindMapId()
      if (!mindmapId) return true

      const nodeUid = node.uid || (node.nodeData && node.nodeData.data && node.nodeData.data.uid) || (node.getData && node.getData('uid'))
      if (!nodeUid) return true // 没有uid的节点不做锁定

      // 检查是否被他人锁定（基于最近一次轮询的缓存）
      const lockInfo = this.lockedNodes[nodeUid]
      const currentUser = this.$store.state.auth.user
      if (lockInfo && currentUser && lockInfo.user_id !== currentUser.id) {
        this.$message.warning(`${lockInfo.display_name} 正在编辑此节点`)
        return false
      }

      // 发起锁定请求（异步），先阻止编辑
      lockNode(mindmapId, nodeUid).then(({ data }) => {
        if (data.success) {
          this.editingNodeUid = nodeUid
          // 启动TTL刷新定时器（每30秒刷新一次）
          this.lockRefreshTimer = setInterval(() => {
            if (this.editingNodeUid) {
              refreshNodeLock(mindmapId, this.editingNodeUid).catch(() => {})
            }
          }, 30000)
          // 设置授权标记，再次调用 startTextEdit 时 beforeTextEdit 会放行
          this.lockGranted = true
          this.mindMap.renderer.startTextEdit()
        } else if (data.locked_by) {
          this.$message.warning(`${data.locked_by.display_name} 正在编辑此节点`)
        }
      }).catch(() => {
        this.$message.error('锁定节点失败')
      })
      return false
    },

    // 编辑结束时解锁节点并保存历史
    handleEndTextEdit() {
      this.mindMap.renderer.endTextEdit()
      if (this.editingNodeUid) {
        const mindmapId = getCurrentMindMapId()
        const editedNodeUid = this.editingNodeUid
        // 停止TTL刷新
        if (this.lockRefreshTimer) {
          clearInterval(this.lockRefreshTimer)
          this.lockRefreshTimer = null
        }
        this.editingNodeUid = null
        // 立即从本地状态移除锁并清除标签，不等轮询
        this.$delete(this.lockedNodes, editedNodeUid)
        this.removeLockLabel(editedNodeUid)
        // 解锁（异步）
        if (mindmapId) {
          unlockNode(mindmapId, editedNodeUid).catch(() => {})
        }
        // 保存编辑历史
        const currentUser = this.$store.state.auth.user
        if (currentUser && mindmapId) {
          saveNodeHistory(mindmapId, {
            node_uid: editedNodeUid,
            user_display_name: currentUser.display_name
          }).then(({ data }) => {
            this.$set(this.nodeHistoryMap, editedNodeUid, data)
          }).catch(() => {})
        }
      }
    },

    // 加载节点编辑历史
    async loadNodeHistory() {
      const mindmapId = getCurrentMindMapId()
      if (!mindmapId || window.takeOverApp) return
      try {
        const { data } = await getNodeHistory(mindmapId)
        const map = {}
        data.forEach(record => {
          // 只保留每个节点最新的一条记录
          if (!map[record.node_uid] || new Date(record.edited_at) > new Date(map[record.node_uid].edited_at)) {
            map[record.node_uid] = record
          }
        })
        this.nodeHistoryMap = map
      } catch (e) {
        // ignore
      }
    },

    // 处理节点激活事件 - 显示编辑历史
    handleNodeActive(node) {
      if (!node || (Array.isArray(node) && node.length === 0)) {
        this.activeNodeHistory = null
        return
      }
      const activeNode = Array.isArray(node) ? node[0] : node
      if (!activeNode) {
        this.activeNodeHistory = null
        return
      }
      const nodeUid = activeNode.uid || (activeNode.nodeData && activeNode.nodeData.data && activeNode.nodeData.data.uid) || (activeNode.getData && activeNode.getData('uid'))
      if (nodeUid && this.nodeHistoryMap[nodeUid]) {
        this.activeNodeHistory = this.nodeHistoryMap[nodeUid]
      } else {
        this.activeNodeHistory = null
      }
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const d = new Date(timeStr)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    // ============ 锁定标签 SVG 覆盖层 ============

    // 更新所有锁定标签
    updateAllLockLabels() {
      // 先清除所有旧标签
      this.clearAllLockLabels()
      // 重新创建（跳过自己持有的锁）
      const currentUser = this.$store.state.auth.user
      for (const [nodeUid, lockInfo] of Object.entries(this.lockedNodes)) {
        if (currentUser && lockInfo.user_id === currentUser.id) continue
        this.updateLockLabel(nodeUid, lockInfo)
      }
    },

    // 为单个节点创建/更新锁定标签
    updateLockLabel(nodeUid, lockInfo) {
      this.removeLockLabel(nodeUid)
      if (!this.mindMap) return

      // 遍历节点找到匹配的
      const node = this.findNodeByUid(nodeUid)
      if (!node) return

      const group = node.group
      if (!group) return

      // 获取节点位置信息
      const { left, top, width } = node
      // 创建锁定标签
      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      labelGroup.setAttribute('class', 'node-lock-label')

      // 背景矩形
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      const text = `${lockInfo.display_name} 编辑中`
      const textWidth = text.length * 12 + 16
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '-24')
      rect.setAttribute('rx', '4')
      rect.setAttribute('ry', '4')
      rect.setAttribute('width', String(textWidth))
      rect.setAttribute('height', '20')
      rect.setAttribute('fill', '#ff9800')
      rect.setAttribute('opacity', '0.9')

      // 文本
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      textEl.setAttribute('x', '8')
      textEl.setAttribute('y', '-10')
      textEl.setAttribute('fill', '#fff')
      textEl.setAttribute('font-size', '12')
      textEl.textContent = text

      labelGroup.appendChild(rect)
      labelGroup.appendChild(textEl)

      // 添加到节点的 group 中
      group.node.appendChild(labelGroup)

      this.lockLabelElements[nodeUid] = labelGroup
    },

    // 移除单个锁定标签
    removeLockLabel(nodeUid) {
      const el = this.lockLabelElements[nodeUid]
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
      delete this.lockLabelElements[nodeUid]
    },

    // 清除所有锁定标签
    clearAllLockLabels() {
      for (const uid of Object.keys(this.lockLabelElements)) {
        this.removeLockLabel(uid)
      }
    },

    // 通过uid查找节点实例
    findNodeByUid(uid) {
      if (!this.mindMap || !this.mindMap.renderer) return null
      // 遍历渲染器中的所有节点
      const root = this.mindMap.renderer.root
      if (!root) return null
      return this._searchNode(root, uid)
    },

    _searchNode(node, uid) {
      const nodeUid = node.uid || (node.nodeData && node.nodeData.data && node.nodeData.data.uid) || (node.getData && node.getData('uid'))
      if (nodeUid === uid) return node
      if (node.children) {
        for (const child of node.children) {
          const found = this._searchNode(child, uid)
          if (found) return found
        }
      }
      return null
    },

    showDownloadTip(title, desc) {
      const h = this.$createElement
      this.$msgbox({
        title,
        message: h('div', null, [
          h(
            'p',
            {
              style: {
                marginBottom: '12px'
              }
            },
            desc
          ),
          h('div', null, [
            h(
              'a',
              {
                attrs: {
                  href:
                    'https://pan.baidu.com/s/1huasEbKsGNH2Af68dvWiOg?pwd=3bp3',
                  target: '_blank'
                },
                style: {
                  color: '#409eff',
                  marginRight: '12px'
                }
              },
              this.$t('edit.downBaidu')
            ),
            h(
              'a',
              {
                attrs: {
                  href: 'https://github.com/wanglin2/mind-map/releases',
                  target: '_blank'
                },
                style: {
                  color: '#409eff'
                }
              },
              this.$t('edit.downGithub')
            )
          ])
        ]),
        showCancelButton: false,
        showConfirmButton: false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.editContainer {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .dragMask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3999;

    .dragTip {
      pointer-events: none;
      font-weight: bold;
    }
  }

  .mindMapContainer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
  }

  .nodeEditStatusBar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 16px;
    border-radius: 4px 4px 0 0;
    font-size: 12px;
    z-index: 1000;
    white-space: nowrap;
  }
}
</style>

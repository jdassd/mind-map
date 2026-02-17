<template>
  <div
    class="container"
    :class="{ isDark: isDark, activeSidebar: activeSidebar }"
  >
    <template v-if="show">
      <Toolbar v-if="!isZenMode"></Toolbar>
      <Edit></Edit>
    </template>
  </div>
</template>

<script>
import Toolbar from './components/Toolbar.vue'
import Edit from './components/Edit.vue'
import { mapState, mapMutations } from 'vuex'
import { getLocalConfig, loadMindMapFromServer, setCurrentMindMapId } from '@/api'

export default {
  components: {
    Toolbar,
    Edit
  },
  data() {
    return {
      show: false,
      serverData: null
    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      isDark: state => state.localConfig.isDark,
      activeSidebar: state => state.activeSidebar
    })
  },
  watch: {
    isDark() {
      this.setBodyDark()
    }
  },
  async created() {
    this.initLocalConfig()
    const loading = this.$loading({
      lock: true,
      text: this.$t('other.loading')
    })
    // 从服务端加载导图数据
    await this.loadFromServer()
    this.show = true
    loading.close()
    this.setBodyDark()
  },
  beforeDestroy() {
    // 清理当前导图ID
    setCurrentMindMapId(null)
  },
  methods: {
    ...mapMutations(['setLocalConfig', 'setIsReadonly']),

    async loadFromServer() {
      // takeover 模式下跳过服务端加载
      if (window.takeOverApp) return
      const id = this.$route.params.id
      if (!id) return
      setCurrentMindMapId(id)
      const result = await loadMindMapFromServer(id)
      if (result) {
        this.serverData = result
        // 如果返回的数据含 data，写入 localStorage 供现有逻辑读取
        if (result.data) {
          localStorage.setItem('SIMPLE_MIND_MAP_DATA', JSON.stringify(result.data))
        }
        if (result.config) {
          localStorage.setItem('SIMPLE_MIND_MAP_CONFIG', JSON.stringify(result.config))
        }
        // 检查权限：如果用户是 viewer 则设为只读
        // 权限信息由后端在 response header 或 data 中返回
        // 此处简单判断：如果 owner_id 不等于当前用户 id，且角色为 viewer
        this.checkPermission(result)
      }
    },

    checkPermission(mapData) {
      const user = this.$store.state.auth.user
      if (!user || !mapData.owner_id) return
      if (mapData.owner_id !== user.id && mapData.team_id) {
        // 团队导图：由后端控制，此处前端检查角色
        // 如果后端返回403则不会到这里，所以能访问说明至少有viewer权限
        // 具体角色判断需要额外API，这里暂时保持可编辑
      }
    },

    // 初始化本地配置
    initLocalConfig() {
      let config = getLocalConfig()
      if (config) {
        this.setLocalConfig({
          ...this.$store.state.localConfig,
          ...config
        })
      }
    },

    setBodyDark() {
      this.isDark
        ? document.body.classList.add('isDark')
        : document.body.classList.remove('isDark')
    }
  }
}
</script>

<style lang="less">
.container {
}

body {
  &.isDark {
    /* el-button */
    .el-button {
      background-color: #363b3f;
      color: hsla(0, 0%, 100%, 0.9);
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-input */
    .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.9);
    }

    .el-input.is-disabled .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.3);
    }

    .el-input-group__append,
    .el-input-group__prepend {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-input-group__append button.el-button {
      color: hsla(0, 0%, 100%, 0.9);
    }

    /* el-select */
    .el-select-dropdown {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);

      .el-select-dropdown__item {
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-select-dropdown__item.selected {
        color: #409eff;
      }

      .el-select-dropdown__item.hover,
      .el-select-dropdown__item:hover {
        background-color: hsla(0, 0%, 100%, 0.05);
      }
    }

    .el-select .el-input.is-disabled .el-input__inner:hover {
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-popper*/
    .el-popper {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-popper[x-placement^='bottom'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='bottom'] .popper__arrow::after {
      border-bottom-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow::after {
      border-top-color: #36393d;
    }

    /* el-tabs */
    .el-tabs__item {
      color: hsla(0, 0%, 100%, 0.6);

      &:hover,
      &.is-active {
        color: #409eff;
      }
    }

    .el-tabs__nav-wrap::after {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-slider */
    .el-slider__runway {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-radio-group */
    .el-radio-group {
      .el-radio-button__inner {
        background-color: #36393d;
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: #fff;
        background-color: #409eff;
      }
    }

    /* el-dialog */
    .el-dialog {
      background-color: #262a2e;

      .el-dialog__header {
        border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
      }

      .el-dialog__title {
        color: hsla(0, 0%, 100%, 0.9);
      }

      .el-dialog__body {
        background-color: #262a2e;
      }

      .el-dialog__footer {
        border-top: 1px solid hsla(0, 0%, 100%, 0.1);
      }
    }

    /* el-upload */
    .el-upload__tip {
      color: #999;
    }

    /* 富文本编辑器 */
    .toastui-editor-main-container {
      background-color: #fff;
    }
  }
}
</style>

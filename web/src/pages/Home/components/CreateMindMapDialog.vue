<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    width="440px" 
    @close="handleClose"
    custom-class="modern-dialog create-mindmap-dialog"
  >
    <div slot="title" class="dialog-header">
      <div class="header-icon">
        <i class="el-icon-plus"></i>
      </div>
      <div class="header-text">
        <h3 class="title">{{ $t('home.createMindMap') }}</h3>
        <p class="subtitle">{{ teamId ? $t('home.createInTeam') : $t('home.createInPersonal') }}</p>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="form" label-position="top" @submit.native.prevent="handleCreate">
      <el-form-item prop="title">
        <div class="custom-label">{{ $t('home.mindMapTitle') }}</div>
        <el-input 
          v-model="form.title" 
          :placeholder="$t('home.titlePlaceholder')" 
          autofocus
          class="modern-input"
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false" class="modern-button secondary">{{ $t('home.cancel') }}</el-button>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="handleCreate" 
        class="modern-button primary"
      >
        {{ $t('home.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createMindMap } from '@/api/mindmaps'
import { createTeamMindMap } from '@/api/teams'
import { getDefaultMindMapData } from '@/api'

export default {
  name: 'CreateMindMapDialog',
  props: {
    visible: Boolean,
    teamId: { type: String, default: null }
  },
  data() {
    return {
      form: { title: '' },
      rules: {
        title: [{ required: true, message: this.$t('home.titleRequired'), trigger: 'blur' }]
      },
      loading: false
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    }
  },
  methods: {
    async handleCreate() {
      try {
        await this.$refs.form.validate()
      } catch { return }
      this.loading = true
      try {
        const defaultData = getDefaultMindMapData()
        defaultData.root.data.text = this.form.title
        const payload = { title: this.form.title, data: defaultData, config: {} }
        if (this.teamId) {
          await createTeamMindMap(this.teamId, payload)
        } else {
          await createMindMap(payload)
        }
        this.$emit('created')
        this.form.title = ''
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('home.createFailed'))
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.form.title = ''
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .modern-dialog {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  .el-dialog__header {
    padding: 32px 32px 20px;
  }
  
  .el-dialog__body {
    padding: 0 32px 24px;
  }
  
  .el-dialog__footer {
    padding: 0 32px 32px;
    border-top: none;
  }

  .el-dialog__headerbtn {
    top: 32px;
    right: 32px;
    font-size: 20px;
    
    &:hover .el-dialog__close {
      color: #409eff;
    }
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;

  .header-icon {
    width: 48px;
    height: 48px;
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .header-text {
    .title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.2;
    }
    
    .subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #6b7280;
    }
  }
}

.custom-label {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.modern-input {
  /deep/ .el-input__inner {
    height: 48px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    padding: 0 16px;
    font-size: 15px;
    transition: all 0.2s;
    
    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
    }
  }
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modern-button {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  margin: 0 !important;

  &.primary {
    background: #409eff;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(64, 158, 255, 0.2);
    
    &:hover {
      background: #66b1ff;
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(64, 158, 255, 0.3);
    }
  }

  &.secondary {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    
    &:hover {
      background: #e5e7eb;
      color: #1f2937;
    }
  }
}
</style>

<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    width="440px" 
    append-to-body
    custom-class="modern-dialog invite-dialog"
  >
    <div slot="title" class="dialog-header">
      <div class="header-icon">
        <i class="el-icon-paper-plane"></i>
      </div>
      <div class="header-text">
        <h3 class="title">{{ $t('home.inviteMember') }}</h3>
        <p class="subtitle">{{ $t('home.inviteMemberDesc') || 'Invite people to collaborate' }}</p>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="form" label-position="top">
      <el-form-item prop="email">
        <div class="custom-label">{{ $t('auth.email') }}</div>
        <el-input 
          v-model="form.email" 
          :placeholder="$t('home.inviteEmailPlaceholder')"
          class="modern-input"
          prefix-icon="el-icon-message"
        ></el-input>
      </el-form-item>
      
      <el-form-item prop="role">
        <div class="custom-label">{{ $t('home.role') }}</div>
        <div class="role-selector">
          <div 
            class="role-option" 
            :class="{ active: form.role === 'editor' }"
            @click="form.role = 'editor'"
          >
            <div class="option-icon"><i class="el-icon-edit"></i></div>
            <div class="option-info">
              <span class="option-name">Editor</span>
              <span class="option-desc">Can edit mind maps</span>
            </div>
            <div class="option-check"><i class="el-icon-check"></i></div>
          </div>
          
          <div 
            class="role-option" 
            :class="{ active: form.role === 'viewer' }"
            @click="form.role = 'viewer'"
          >
            <div class="option-icon"><i class="el-icon-view"></i></div>
            <div class="option-info">
              <span class="option-name">Viewer</span>
              <span class="option-desc">Read only access</span>
            </div>
            <div class="option-check"><i class="el-icon-check"></i></div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false" class="modern-button secondary">{{ $t('home.cancel') }}</el-button>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="handleInvite" 
        class="modern-button primary"
      >
        {{ $t('home.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { inviteMember } from '@/api/teams'

export default {
  name: 'InviteMemberDialog',
  props: {
    visible: Boolean,
    teamId: { type: String, required: true }
  },
  data() {
    return {
      form: { email: '', role: 'viewer' },
      rules: {
        email: [{ required: true, type: 'email', message: this.$t('auth.emailRequired'), trigger: 'blur' }]
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
    async handleInvite() {
      try { await this.$refs.form.validate() } catch { return }
      this.loading = true
      try {
        await inviteMember(this.teamId, this.form)
        this.$message.success(this.$t('home.inviteSuccess'))
        this.$emit('invited')
        this.dialogVisible = false
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('home.inviteFailed'))
      } finally {
        this.loading = false
      }
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
    font-size: 22px;
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
    padding-left: 40px;
    font-size: 15px;
    transition: all 0.2s;
    
    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
    }
  }
  
  /deep/ .el-input__prefix {
    left: 12px;
    line-height: 48px;
    font-size: 18px;
  }
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.02);
  }

  &.active {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.05);
    
    .option-icon {
      background: #409eff;
      color: white;
    }
    
    .option-check {
      opacity: 1;
      transform: scale(1);
    }
  }

  .option-icon {
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-right: 12px;
    transition: all 0.2s;
  }

  .option-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .option-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .option-desc {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .option-check {
    color: #409eff;
    font-size: 20px;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s;
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

<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    width="720px"
    custom-class="modern-dialog team-detail-dialog"
  >
    <div slot="title" class="dialog-header">
      <div class="header-icon">
        <i class="el-icon-office-building"></i>
      </div>
      <div class="header-text">
        <h3 class="title">{{ $t('home.teamSettings') }}</h3>
        <p class="subtitle" v-if="teamData">{{ teamData.name }}</p>
      </div>
    </div>

    <div v-if="teamData" v-loading="loading" class="team-content">
      <!-- 团队概览 -->
      <div class="section team-info-section">
        <div class="info-card">
          <div class="info-item">
            <span class="label">{{ $t('home.teamName') }}</span>
            <span class="value">{{ teamData.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('home.teamDesc') }}</span>
            <span class="value">{{ teamData.description || $t('home.noDescription') || 'No description provided' }}</span>
          </div>
        </div>
      </div>

      <!-- 成员列表 -->
      <div class="section members-section">
        <div class="section-header">
          <h4 class="section-title">
            {{ $t('home.members') }}
            <span class="count">{{ teamData.members ? teamData.members.length : 0 }}</span>
          </h4>
          <el-button 
            size="small" 
            type="primary" 
            icon="el-icon-plus" 
            @click="showInvite = true"
            class="invite-btn"
          >
            {{ $t('home.inviteMember') }}
          </el-button>
        </div>

        <div class="members-table-wrapper">
          <el-table :data="teamData.members" style="width: 100%" class="modern-table">
            <el-table-column :label="$t('home.name')" min-width="200">
              <template slot-scope="{ row }">
                <div class="member-info">
                  <div class="member-avatar">
                    {{ row.display_name ? row.display_name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div class="member-details">
                    <span class="name">{{ row.display_name }}</span>
                    <span class="email">{{ row.email }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column :label="$t('home.role')" width="140">
              <template slot-scope="{ row }">
                <div class="role-tag" :class="row.role">
                  {{ row.role }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column :label="$t('home.actions')" width="180" align="right" v-if="isOwner">
              <template slot-scope="{ row }">
                <div class="action-buttons" v-if="row.role !== 'owner'">
                  <el-select 
                    v-model="row.role" 
                    size="mini" 
                    class="role-mini-select"
                    @change="handleRoleChange(row)"
                  >
                    <el-option value="editor" label="Editor" />
                    <el-option value="viewer" label="Viewer" />
                  </el-select>
                  <el-button 
                    type="text" 
                    icon="el-icon-delete" 
                    class="delete-btn"
                    @click="handleRemove(row)"
                  ></el-button>
                </div>
                <div v-else class="owner-placeholder">-</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    
    <InviteMemberDialog v-if="showInvite" :visible.sync="showInvite" :team-id="teamId" @invited="loadTeam" />
  </el-dialog>
</template>

<script>
import { updateMemberRole, removeMember } from '@/api/teams'
import InviteMemberDialog from './InviteMemberDialog.vue'

export default {
  name: 'TeamDetail',
  components: { InviteMemberDialog },
  props: {
    visible: Boolean,
    teamId: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      teamData: null,
      showInvite: false
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    isOwner() {
      if (!this.teamData) return false
      const user = this.$store.state.auth.user
      return user && this.teamData.owner_id === user.id
    }
  },
  watch: {
    visible(val) {
      if (val) this.loadTeam()
    }
  },
  methods: {
    async loadTeam() {
      this.loading = true
      try {
        this.teamData = await this.$store.dispatch('team/fetchTeamDetail', this.teamId)
      } finally {
        this.loading = false
      }
    },
    async handleRoleChange(row) {
      try {
        await updateMemberRole(this.teamId, row.user_id, { role: row.role })
        this.$message.success(this.$t('home.roleUpdated'))
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('home.updateFailed'))
        this.loadTeam()
      }
    },
    async handleRemove(row) {
      try {
        await this.$confirm(this.$t('home.confirmRemoveMember'), this.$t('home.warning'), {
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        })
        await removeMember(this.teamId, row.user_id)
        this.$message.success(this.$t('home.removeSuccess') || 'Removed successfully')
        this.loadTeam()
      } catch {}
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
    border-bottom: 1px solid #f3f4f6;
  }
  
  .el-dialog__body {
    padding: 0;
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

.team-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 32px;
}

.section {
  margin-bottom: 32px;
  &:last-child { margin-bottom: 0; }
}

.info-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  border: 1px solid #f3f4f6;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9ca3af;
    }

    .value {
      font-size: 15px;
      font-weight: 500;
      color: #1f2937;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;

    .count {
      background: #f3f4f6;
      color: #6b7280;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }
}

.invite-btn {
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 16px;
}

.members-table-wrapper {
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  overflow: hidden;
}

.modern-table {
  /deep/ th {
    background-color: #f9fafb;
    color: #6b7280;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
  }
  
  /deep/ td {
    padding: 16px;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .member-avatar {
      width: 36px;
      height: 36px;
      background: #409eff;
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .member-details {
      display: flex;
      flex-direction: column;
      
      .name {
        font-weight: 600;
        color: #111827;
        font-size: 14px;
      }
      
      .email {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }
}

.role-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.owner {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
  
  &.editor {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
  
  &.viewer {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;

  .role-mini-select {
    width: 100px;
    /deep/ .el-input__inner {
      height: 28px;
      line-height: 28px;
      border-radius: 6px;
      font-size: 12px;
      padding: 0 8px;
    }
  }

  .delete-btn {
    color: #9ca3af;
    font-size: 16px;
    padding: 0;
    
    &:hover {
      color: #ef4444;
    }
  }
}

.owner-placeholder {
  color: #d1d5db;
  font-size: 12px;
  padding-right: 12px;
}
</style>

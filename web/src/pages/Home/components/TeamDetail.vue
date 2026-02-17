<template>
  <el-dialog :title="$t('home.teamSettings')" :visible.sync="dialogVisible" width="600px">
    <div v-if="teamData" v-loading="loading">
      <el-descriptions :title="$t('home.teamInfo')" :column="1" border size="small">
        <el-descriptions-item :label="$t('home.teamName')">{{ teamData.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('home.teamDesc')">{{ teamData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
      <h4 style="margin: 16px 0 8px">{{ $t('home.members') }}</h4>
      <div style="margin-bottom: 12px">
        <el-button size="mini" type="primary" icon="el-icon-plus" @click="showInvite = true">{{ $t('home.inviteMember') }}</el-button>
      </div>
      <el-table :data="teamData.members" size="small" border>
        <el-table-column prop="display_name" :label="$t('home.name')" />
        <el-table-column prop="email" :label="$t('auth.email')" />
        <el-table-column prop="role" :label="$t('home.role')" width="120">
          <template slot-scope="{ row }">
            <el-tag :type="row.role === 'owner' ? 'danger' : row.role === 'editor' ? 'warning' : 'info'" size="mini">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('home.actions')" width="160" v-if="isOwner">
          <template slot-scope="{ row }">
            <template v-if="row.role !== 'owner'">
              <el-select v-model="row.role" size="mini" style="width: 90px" @change="handleRoleChange(row)">
                <el-option value="editor" label="editor" />
                <el-option value="viewer" label="viewer" />
              </el-select>
              <el-button type="text" size="mini" style="color: #f56c6c; margin-left: 8px" @click="handleRemove(row)">
                <i class="el-icon-delete"></i>
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
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
        await this.$confirm(this.$t('home.confirmRemoveMember'))
        await removeMember(this.teamId, row.user_id)
        this.loadTeam()
      } catch {}
    }
  }
}
</script>

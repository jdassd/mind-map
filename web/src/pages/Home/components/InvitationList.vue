<template>
  <div class="invitation-list" v-if="invitations.length > 0">
    <h4>{{ $t('home.pendingInvitations') }}</h4>
    <div v-for="inv in invitations" :key="inv.id" class="invitation-item">
      <div class="inv-info">
        <span class="inv-team">{{ inv.team_name }}</span>
        <span class="inv-meta">{{ $t('home.invitedBy') }} {{ inv.inviter_email }} · {{ inv.role }}</span>
      </div>
      <div class="inv-actions">
        <el-button size="mini" type="primary" @click="handleAccept(inv)">{{ $t('home.accept') }}</el-button>
        <el-button size="mini" @click="handleDecline(inv)">{{ $t('home.decline') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { acceptInvitation, declineInvitation } from '@/api/teams'

export default {
  name: 'InvitationList',
  computed: {
    invitations() {
      return this.$store.state.team.invitations
    }
  },
  created() {
    this.$store.dispatch('team/fetchInvitations')
  },
  methods: {
    async handleAccept(inv) {
      try {
        await acceptInvitation(inv.id)
        this.$message.success(this.$t('home.accepted'))
        this.$store.dispatch('team/fetchInvitations')
        this.$store.dispatch('team/fetchTeams')
      } catch {
        this.$message.error(this.$t('home.operationFailed'))
      }
    },
    async handleDecline(inv) {
      try {
        await declineInvitation(inv.id)
        this.$store.dispatch('team/fetchInvitations')
      } catch {
        this.$message.error(this.$t('home.operationFailed'))
      }
    }
  }
}
</script>

<style lang="less" scoped>
.invitation-list {
  margin-bottom: 20px;
  h4 { margin-bottom: 8px; color: #e6a23c; }
}
.invitation-item {
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.inv-info {
  display: flex;
  flex-direction: column;
}
.inv-team {
  font-weight: 600;
  color: #333;
}
.inv-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>

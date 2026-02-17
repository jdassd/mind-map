<template>
  <div class="home-page">
    <AppHeader />
    <div class="home-body">
      <TeamSidebar
        :teams="teams"
        :active-team-id="activeTeamId"
        @select="handleTeamSelect"
        @create-team="showCreateTeam = true"
      />
      <div class="home-content">
        <div class="content-header">
          <h3>{{ activeTeamId ? teamName : $t('home.myMindMaps') }}</h3>
          <div class="content-actions">
            <el-input
              v-model="searchText"
              :placeholder="$t('home.search')"
              prefix-icon="el-icon-search"
              size="small"
              clearable
              style="width: 200px; margin-right: 12px"
            />
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showCreateDialog = true">
              {{ $t('home.newMindMap') }}
            </el-button>
            <el-button v-if="activeTeamId" size="small" icon="el-icon-setting" @click="showTeamDetail = true">
              {{ $t('home.teamSettings') }}
            </el-button>
          </div>
        </div>
        <InvitationList v-if="!activeTeamId" />
        <MindMapList :items="filteredList" :loading="loading" @open="handleOpen" @delete="handleDelete" />
      </div>
    </div>
    <CreateMindMapDialog :visible.sync="showCreateDialog" :team-id="activeTeamId" @created="handleCreated" />
    <TeamCreateDialog :visible.sync="showCreateTeam" @created="handleTeamCreated" />
    <TeamDetail v-if="activeTeamId" :visible.sync="showTeamDetail" :team-id="activeTeamId" />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import TeamSidebar from './components/TeamSidebar.vue'
import MindMapList from './components/MindMapList.vue'
import CreateMindMapDialog from './components/CreateMindMapDialog.vue'
import TeamCreateDialog from './components/TeamCreateDialog.vue'
import TeamDetail from './components/TeamDetail.vue'
import InvitationList from './components/InvitationList.vue'
import { getTextFromHtml } from '@/utils'

export default {
  name: 'Home',
  components: { AppHeader, TeamSidebar, MindMapList, CreateMindMapDialog, TeamCreateDialog, TeamDetail, InvitationList },
  data() {
    return {
      activeTeamId: null,
      searchText: '',
      showCreateDialog: false,
      showCreateTeam: false,
      showTeamDetail: false
    }
  },
  computed: {
    teams() {
      return this.$store.state.team.list
    },
    list() {
      return this.$store.state.mindmap.list
    },
    loading() {
      return this.$store.state.mindmap.loading
    },
    filteredList() {
      if (!this.searchText) return this.list
      const s = this.searchText.toLowerCase()
      return this.list.filter(item => getTextFromHtml(item.title).toLowerCase().includes(s))
    },
    teamName() {
      const t = this.teams.find(t => t.id === this.activeTeamId)
      return t ? t.name : ''
    }
  },
  created() {
    this.$store.dispatch('auth/fetchUser')
    this.$store.dispatch('team/fetchTeams')
    this.loadList()
  },
  methods: {
    loadList() {
      this.$store.dispatch('mindmap/fetchList', this.activeTeamId)
    },
    handleTeamSelect(teamId) {
      this.activeTeamId = teamId
      this.loadList()
    },
    handleOpen(item) {
      this.$router.push(`/edit/${item.id}`)
    },
    handleDelete(item) {
      this.$confirm(this.$t('home.confirmDelete'), this.$t('home.warning'), {
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('mindmap/deleteItem', item.id)
      }).catch(() => {})
    },
    handleCreated() {
      this.showCreateDialog = false
      this.loadList()
    },
    handleTeamCreated() {
      this.showCreateTeam = false
      this.$store.dispatch('team/fetchTeams')
    }
  }
}
</script>

<style lang="less" scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}
.home-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.home-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    font-size: 18px;
    color: #333;
  }
}
.content-actions {
  display: flex;
  align-items: center;
}
</style>

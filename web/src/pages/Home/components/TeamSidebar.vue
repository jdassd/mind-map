<template>
  <div class="team-sidebar">
    <div
      class="sidebar-item"
      :class="{ active: !activeTeamId }"
      @click="$emit('select', null)"
    >
      <i class="el-icon-user"></i>
      <span>{{ $t('home.myMindMaps') }}</span>
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-label">{{ $t('home.teams') }}</div>
    <div
      v-for="team in teams"
      :key="team.id"
      class="sidebar-item"
      :class="{ active: activeTeamId === team.id }"
      @click="$emit('select', team.id)"
    >
      <i class="el-icon-office-building"></i>
      <span>{{ team.name }}</span>
    </div>
    <div class="sidebar-item create-btn" @click="$emit('create-team')">
      <i class="el-icon-plus"></i>
      <span>{{ $t('home.newTeam') }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamSidebar',
  props: {
    teams: { type: Array, default: () => [] },
    activeTeamId: { type: String, default: null }
  }
}
</script>

<style lang="less" scoped>
.team-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 12px 0;
  flex-shrink: 0;
  overflow-y: auto;
}
.sidebar-item {
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
  transition: background 0.2s;
  i { margin-right: 8px; font-size: 16px; }
  span { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:hover { background: #f5f7fa; }
  &.active { background: #ecf5ff; color: #409eff; }
}
.sidebar-divider {
  height: 1px;
  background: #ebeef5;
  margin: 8px 0;
}
.sidebar-label {
  padding: 6px 20px;
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
}
.create-btn {
  color: #409eff;
}
</style>

<template>
  <div class="team-sidebar">
    <div class="sidebar-section">
      <div
        class="sidebar-item"
        :class="{ active: !activeTeamId }"
        @click="$emit('select', null)"
      >
        <div class="item-icon">
          <i class="el-icon-user"></i>
        </div>
        <span>{{ $t('home.myMindMaps') }}</span>
      </div>
    </div>

    <div class="sidebar-divider"></div>
    
    <div class="sidebar-section">
      <div class="section-header">
        <span class="section-label">{{ $t('home.teams') }}</span>
      </div>
      
      <div class="team-list">
        <div
          v-for="team in teams"
          :key="team.id"
          class="sidebar-item"
          :class="{ active: activeTeamId === team.id }"
          @click="$emit('select', team.id)"
        >
          <div class="item-icon team-icon">
            <i class="el-icon-office-building"></i>
          </div>
          <span>{{ team.name }}</span>
        </div>

        <div class="sidebar-item create-btn" @click="$emit('create-team')">
          <div class="item-icon add-icon">
            <i class="el-icon-plus"></i>
          </div>
          <span>{{ $t('home.newTeam') }}</span>
        </div>
      </div>
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
  width: 260px;
  padding: 24px 12px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-header {
  padding: 8px 16px;
  margin-bottom: 4px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-item {
  height: 44px;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #4b5563;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2px;

  .item-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    background: transparent;
    transition: all 0.2s;
    
    i {
      font-size: 18px;
    }
  }

  span {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    color: #409eff;
    .item-icon {
      background: #f3f4f6;
    }
  }

  &.active {
    background: #fff;
    color: #409eff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    .item-icon {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }
    
    span {
      font-weight: 600;
    }
  }
}

.sidebar-divider {
  height: 1px;
  background: rgba(229, 231, 235, 0.5);
  margin: 12px 16px;
}

.create-btn {
  color: #409eff;
  margin-top: 4px;
  
  .add-icon {
    background: rgba(64, 158, 255, 0.05);
    color: #409eff;
  }
  
  &:hover {
    .add-icon {
      background: #409eff;
      color: #fff;
    }
  }
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// 隐藏滚动条
.team-sidebar::-webkit-scrollbar {
  width: 0;
  background: transparent;
}
</style>

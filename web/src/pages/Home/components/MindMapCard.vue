<template>
  <div class="mindmap-card" @click="$emit('open')">
    <div class="card-main">
      <div class="card-icon-wrapper">
        <div class="icon-bg">
          <i class="el-icon-connection"></i>
        </div>
      </div>
      <div class="card-content">
        <h4 class="card-title" :title="getTextFromHtml(item.title)">{{ getTextFromHtml(item.title) || 'Untitled' }}</h4>
        <div class="card-meta">
          <i class="el-icon-time"></i>
          <span>{{ formatTime(item.updated_at) }}</span>
        </div>
      </div>
    </div>
    <div class="card-actions" @click.stop>
      <el-dropdown trigger="click" @command="handleCommand" placement="bottom-end">
        <div class="more-btn">
          <i class="el-icon-more"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="card-dropdown">
          <el-dropdown-item command="open">
            <i class="el-icon-folder-opened"></i>{{ $t('home.open') }}
          </el-dropdown-item>
          <el-dropdown-item command="delete" class="delete-item">
            <i class="el-icon-delete"></i>{{ $t('home.delete') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { getTextFromHtml } from '@/utils'

export default {
  name: 'MindMapCard',
  props: {
    item: { type: Object, required: true }
  },
  methods: {
    getTextFromHtml,
    handleCommand(cmd) {
      this.$emit(cmd)
    },
    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString()
    }
  }
}
</script>

<style lang="less" scoped>
.mindmap-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #fff;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
    border-color: rgba(64, 158, 255, 0.3);

    .icon-bg {
      transform: scale(1.1);
      box-shadow: 0 8px 16px -4px rgba(64, 158, 255, 0.4);
    }
  }
}

.card-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.card-icon-wrapper {
  margin-right: 16px;
  flex-shrink: 0;
}

.icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #409eff, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  i {
    color: #fff;
    font-size: 24px;
  }
}

.card-content {
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #9ca3af;
  
  i {
    margin-right: 4px;
    font-size: 14px;
  }
}

.card-actions {
  .more-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #409eff;
    }
  }
}

.delete-item {
  color: #ef4444 !important;
  &:hover {
    background-color: #fef2f2 !important;
  }
}

/deep/ .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  
  i {
    margin-right: 8px;
    font-size: 16px;
  }
}
</style>

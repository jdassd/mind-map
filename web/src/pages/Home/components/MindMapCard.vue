<template>
  <div class="mindmap-card" @click="$emit('open')">
    <div class="card-body">
      <div class="card-icon">
        <i class="el-icon-connection"></i>
      </div>
      <div class="card-info">
        <h4 class="card-title">{{ getTextFromHtml(item.title) || 'Untitled' }}</h4>
        <span class="card-time">{{ formatTime(item.updated_at) }}</span>
      </div>
    </div>
    <div class="card-actions" @click.stop>
      <el-dropdown trigger="click" @command="handleCommand">
        <i class="el-icon-more"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="open">{{ $t('home.open') }}</el-dropdown-item>
          <el-dropdown-item command="delete" divided>
            <span style="color: #f56c6c">{{ $t('home.delete') }}</span>
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
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style lang="less" scoped>
.mindmap-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
.card-body {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  i { color: #fff; font-size: 20px; }
}
.card-info {
  min-width: 0;
}
.card-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-time {
  font-size: 12px;
  color: #999;
}
.card-actions {
  .el-icon-more {
    font-size: 16px;
    color: #999;
    cursor: pointer;
    padding: 4px;
    &:hover { color: #409eff; }
  }
}
</style>

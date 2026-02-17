<template>
  <div class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <i class="el-icon-connection"></i>
        <span>MindMap</span>
      </router-link>
    </div>
    <div class="header-right">
      <UserAvatar />
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar.vue'

export default {
  name: 'AppHeader',
  components: { UserAvatar }
}
</script>

<style lang="less" scoped>
.app-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}
.header-left {
  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    i { font-size: 24px; margin-right: 8px; color: #409eff; }
  }
}
</style>

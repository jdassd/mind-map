<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="user-avatar">
      <div class="avatar-circle">
        {{ initial }}
      </div>
      <span class="user-name">{{ displayName }}</span>
      <i class="el-icon-arrow-down"></i>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item disabled>
        <span style="color: #333">{{ user ? user.email : '' }}</span>
      </el-dropdown-item>
      <el-dropdown-item command="logout" divided>
        <i class="el-icon-switch-button"></i>
        {{ $t('auth.logout') }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'UserAvatar',
  computed: {
    user() {
      return this.$store.state.auth.user
    },
    displayName() {
      return this.user ? this.user.display_name : ''
    },
    initial() {
      return this.displayName ? this.displayName.charAt(0).toUpperCase() : '?'
    }
  },
  methods: {
    handleCommand(cmd) {
      if (cmd === 'logout') {
        this.$store.dispatch('auth/logout')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  &:hover { background: #f5f7fa; }
}
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 8px;
}
.user-name {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
}
</style>

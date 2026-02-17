<template>
  <div class="login-page">
    <div class="login-card">
      <h2>{{ $t('auth.loginTitle') }}</h2>
      <el-form :model="form" :rules="rules" ref="loginForm" @submit.native.prevent="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="form.email" :placeholder="$t('auth.email')" prefix-icon="el-icon-message"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" :placeholder="$t('auth.password')" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">{{ $t('auth.login') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span>{{ $t('auth.noAccount') }}</span>
        <router-link to="/register">{{ $t('auth.goRegister') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      form: { email: '', password: '' },
      rules: {
        email: [{ required: true, message: this.$t('auth.emailRequired'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('auth.passwordRequired'), trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      try {
        await this.$refs.loginForm.validate()
      } catch {
        return
      }
      this.loading = true
      try {
        await this.$store.dispatch('auth/login', this.form)
        await this.$store.dispatch('auth/fetchUser')
        this.$router.push('/')
      } catch (err) {
        const msg = err.response && err.response.data && err.response.data.detail
        this.$message.error(msg || this.$t('auth.loginFailed'))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}
.login-footer {
  text-align: center;
  margin-top: 12px;
  color: #666;
  a {
    color: #409eff;
    margin-left: 8px;
  }
}
</style>

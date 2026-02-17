<template>
  <div class="register-page">
    <div class="register-card">
      <h2>{{ $t('auth.registerTitle') }}</h2>
      <el-form :model="form" :rules="rules" ref="registerForm" @submit.native.prevent="handleRegister">
        <el-form-item prop="display_name">
          <el-input v-model="form.display_name" :placeholder="$t('auth.displayName')" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" :placeholder="$t('auth.email')" prefix-icon="el-icon-message"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" :placeholder="$t('auth.password')" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" :placeholder="$t('auth.confirmPassword')" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">{{ $t('auth.register') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <span>{{ $t('auth.hasAccount') }}</span>
        <router-link to="/login">{{ $t('auth.goLogin') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error(this.$t('auth.passwordMismatch')))
      } else {
        callback()
      }
    }
    return {
      form: { display_name: '', email: '', password: '', confirmPassword: '' },
      rules: {
        display_name: [{ required: true, message: this.$t('auth.nameRequired'), trigger: 'blur' }],
        email: [{ required: true, message: this.$t('auth.emailRequired'), trigger: 'blur' }],
        password: [{ required: true, message: this.$t('auth.passwordRequired'), trigger: 'blur' }, { min: 6, message: this.$t('auth.passwordMin'), trigger: 'blur' }],
        confirmPassword: [{ required: true, message: this.$t('auth.confirmRequired'), trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      try {
        await this.$refs.registerForm.validate()
      } catch {
        return
      }
      this.loading = true
      try {
        await this.$store.dispatch('auth/register', {
          email: this.form.email,
          password: this.form.password,
          display_name: this.form.display_name
        })
        this.$message.success(this.$t('auth.registerSuccess'))
        this.$router.push('/login')
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('auth.registerFailed'))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.register-card {
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
.register-footer {
  text-align: center;
  margin-top: 12px;
  color: #666;
  a {
    color: #409eff;
    margin-left: 8px;
  }
}
</style>

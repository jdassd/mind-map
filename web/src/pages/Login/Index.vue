<template>
  <div class="login-page">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-area">
            <i class="el-icon-connection"></i>
          </div>
          <h2 class="title">MindMap</h2>
          <p class="subtitle">{{ $t('auth.loginTitle') }}</p>
        </div>

        <el-form 
          :model="form" 
          :rules="rules" 
          ref="loginForm" 
          @submit.native.prevent="handleLogin"
          class="login-form"
        >
          <el-form-item prop="email">
            <div class="input-label">{{ $t('auth.email') }}</div>
            <el-input 
              v-model="form.email" 
              placeholder="example@mail.com" 
              prefix-icon="el-icon-message"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <div class="input-label">{{ $t('auth.password') }}</div>
            <el-input 
              v-model="form.password" 
              type="password" 
              :placeholder="$t('auth.password')" 
              prefix-icon="el-icon-lock" 
              show-password
            ></el-input>
          </el-form-item>
          
          <el-form-item class="submit-item">
            <el-button 
              type="primary" 
              :loading="loading" 
              native-type="submit" 
              class="login-button"
            >
              {{ $t('auth.login') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>{{ $t('auth.noAccount') }}</span>
          <router-link to="/register" class="register-link">{{ $t('auth.goRegister') }}</router-link>
        </div>
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
        email: [
          { required: true, message: this.$t('auth.emailRequired'), trigger: 'blur' },
          { type: 'email', message: this.$t('auth.emailInvalid'), trigger: 'blur' }
        ],
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
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
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
  background-color: #f8faff;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: float 20s infinite alternate ease-in-out;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: #409eff;
    top: -100px;
    right: -100px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: #764ba2;
    bottom: -50px;
    left: -50px;
    animation-delay: -5s;
  }

  .circle-3 {
    width: 250px;
    height: 250px;
    background: #667eea;
    top: 20%;
    left: 15%;
    animation-delay: -10s;
  }
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, 40px) scale(1.1); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 20px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo-area {
      width: 56px;
      height: 56px;
      background: #409eff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 10px 15px -3px rgba(64, 158, 255, 0.3);
      
      i {
        font-size: 32px;
        color: white;
      }
    }

    .title {
      font-size: 28px;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 15px;
      color: #666;
      margin-top: 8px;
    }
  }
}

.login-form {
  .input-label {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 8px;
    line-height: 1;
  }

  /deep/ .el-input__inner {
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    transition: all 0.3s;
    font-size: 15px;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
    }
  }

  /deep/ .el-input__prefix {
    left: 12px;
    color: #9ca3af;
    line-height: 48px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .forgot-link {
      font-size: 14px;
      color: #409eff;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .submit-item {
    margin-bottom: 0;
  }

  .login-button {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: #409eff;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(64, 158, 255, 0.2);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(64, 158, 255, 0.3);
      opacity: 0.95;
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #6b7280;

  .register-link {
    color: #409eff;
    font-weight: 600;
    text-decoration: none;
    margin-left: 6px;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 响应式
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
}
</style>

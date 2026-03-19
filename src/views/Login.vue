<template>
  <div class="login-container">
    <div class="login-form">
      <h1 class="logo">Caiyun IPA</h1>
      <h2>知识产权代理管理系统</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" />
        </div>
        <div class="form-item">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="form.password" placeholder="请输入密码" />
        </div>
        <div class="form-item remember">
          <input type="checkbox" id="remember" v-model="form.remember" />
          <label for="remember">记住密码</label>
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  // 模拟登录验证
  if (form.value.username && form.value.password) {
    router.push('/app/dashboard')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 10px;
}

.login-form h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
  text-align: left;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

.form-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.remember {
  display: flex;
  align-items: center;
}

.remember input {
  width: auto;
  margin-right: 8px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover {
  background: #40a9ff;
}

.login-button:active {
  background: #096dd9;
}
</style>
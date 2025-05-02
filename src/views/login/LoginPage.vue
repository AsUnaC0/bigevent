<script setup>
import { userRegisterService,userLoginService } from '@/api/user.js'
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/index'
import {useRouter} from 'vue-router'
const isRegister = ref(false)
const form=ref(null)
// 整个用于提交的form数据对象
const formModel = ref({
    username: '',
    password: '',
    repassword:''
})
// 整个表单的校验规则
// 1.非空校验:required message:信息提示 trigger:触发校验的时机
// 2.长度校验:min max
// 3.正则校验:pattern \S 非空字符
// 4..自定义校验:validator 自己写逻辑
// validator:(rule,value,callback)
// (1)rule 当前校验规则相关的信息
// (2)value 当前校验的数据
// (3)callback 校验成功或者失败的回调函数 
  // -如果校验成功，调用callback()，表示校验成功
  // -如果校验失败，调用callback(new Error('提示信息'))，表示校验失败
const rules = {
    username:[
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
        },
        {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
        },
        {
            pattern:/^\S{6,15}$/,
            message: '密码必须为6-15位非空字符',
            trigger: 'blur'
        }
  ],
    repassword: [
     {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
    },
    {
            pattern:/^\S{6,15}$/,
            message: '密码必须为6-15位非空字符',
            trigger: 'blur'
    },
    {
          validator: (rule, value, callback) => {
            // 判断value和当前form中收集的password是否一致
            if (value !== formModel.value.password) {
              callback(new Error('两次密码不一致'))
            } else {
              callback() //校验成功也需要callback
            }
      },
      trigger: 'blur'
    }
  ]
}

const register = async () => {
  // 注册成功之前，先进行校验，校验成功 => 请求,校验失败 => 提示信息
  await form.value.validate()
  await userRegisterService(formModel.value)
  ElMessage.success('注册成功')
  isRegister.value = false // 注册成功，切换到登录
}

const userStore = useUserStore()
const router=useRouter()

const login = async () => {
  // 登录成功之前，先进行校验，校验成功 => 请求,校验失败 => 提示信息
  await form.value.validate()
  const res=await userLoginService(formModel.value)
  userStore.setToken(res.data.token) // 将token存储到pinia中
  ElMessage.success('登录成功')
  router.push('/') // 登录成功，跳转到首页
}

watch(isRegister, () => {
  formModel.value = {
    username: '',
    password: '',
    repassword:''
  }
})
</script>

<template>
    <!-- 校验相关
    1.el-form => :model='ruleForm' 绑定整个form的数据对象
    2.el-form => :rules='rules' 绑定整个rules的校验规则对象
    3.表单元素 => v-model='ruleForm.xxx' 给表单元素 绑定form的子属性
    4.el-form-item => prop='xxx' props配置生效的是哪个校验规则
    -->
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
        <!-- 注册相关表单 -->
      <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off" v-if="isRegister">
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="register" class="button" type="primary" auto-insert-space>
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
        <!-- 登录相关表单 -->
      <el-form :rules="rules" :model="formModel" ref="form" size="large" autocomplete="off" v-else>
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="login" class="button" type="primary" auto-insert-space
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
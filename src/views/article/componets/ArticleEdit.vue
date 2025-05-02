<script setup>
import { ref } from 'vue'
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {
  artPublishService,
  artGetDetailService,
  artEditService
} from '@/api/article'
import { baseURL } from '@/utils/request'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 控制抽屉显示
const visibleDrawer = ref(false)

// 默认数据
const defaultForm = {
  title: '', //标题
  cate_id: '', //分类id
  cover_img: '', //封面图片 file对象
  content: '', //string内容
  state: '' //状态
}

// 准备数据
const formModel = ref({ ...defaultForm })
// 图片上传相关逻辑
const imgUrl = ref('')
const onSelectFile = (uploadFile) => {
  imgUrl.value = URL.createObjectURL(uploadFile.raw) //预览图片
  // 将图片存入，准备提交
  formModel.value.cover_img = uploadFile.raw
}

// 提交
const emit = defineEmits(['success'])
const onPublish = async (state) => {
  // 将已发布还是草稿状态，存入formodel
  formModel.value.state = state
  // 注意：当前接口需要的是formData对象
  // 将普通对象 转化成formData对象
  const fd = new FormData()
  for (let key in formModel.value) {
    fd.append(key, formModel.value[key])
  }

  // 发请求
  if (formModel.value.id) {
    // 编辑操作
    await artEditService(fd)
    ElMessage.success('修改成功')
    visibleDrawer.value = false
    emit('success', 'edit')
  } else {
    // 添加操作
    console.log(formModel.value)

    await artPublishService(fd)
    ElMessage.success('添加成功')
    visibleDrawer.value = false
    // 通知父组件 添加成功了
    emit('success', 'add')
  }
}

// 组件对外暴露一个方法open ,基于open传来的参数，区分是添加还是编辑
// open({}) =>表单无需渲染 说明是添加
// open({id,name...}) =>表单需要渲染 说明是编辑
// open 调用后可以打开抽屉
const editorRef = ref()

const open = async (row) => {
  visibleDrawer.value = true //显示抽屉
  if (row.id) {
    // 需要基于row.id发送请求，获取编辑对应的详情数据，进行回显
    const res = await artGetDetailService(row.id)
    formModel.value = res.data.data
    // 图片需要单独处理回显
    imgUrl.value = baseURL + formModel.value.cover_img
    // 注意 :提交给后台，需要的数据格式，是file对象格式
    // 需要将网络图片地址=>转化成file对象，存储起来,将来用于提交
    const file = await imageUrlToFile(imgUrl.value, formModel.value.cover_img)
    formModel.value.cover_img = file
  } else {
    formModel.value = { ...defaultForm } //重置form数据
    imgUrl.value = ''
    editorRef.value.setHTML('')
  }
  console.log(row)
}

// 将网络图片地址转换为File对象
async function imageUrlToFile(url, fileName) {
  try {
    // 第一步：使用axios获取网络图片数据
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const imageData = response.data

    // 第二步：将图片数据转换为Blob对象
    const blob = new Blob([imageData], {
      type: response.headers['content-type']
    })

    // 第三步：创建一个新的File对象
    const file = new File([blob], fileName, { type: blob.type })

    return file
  } catch (error) {
    console.error('将图片转换为File对象时发生错误:', error)
    throw error
  }
}

defineExpose({
  open
})
</script>

import ChannelSelect from './ChannelSelect.vue'

<template>
  <el-drawer
    v-model="visibleDrawer"
    :title="formModel.id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form :model="formModel" ref="formRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <channel-select
          v-model="formModel.cate_id"
          width="100%"
        ></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <!-- 此处需要关闭element-plus的自动上传 不需要配置action等参数
         只需要做前端的本地图片预览即可，无需在提交前上传图片
         语法：URL.createObjectURL(...)创建本地预览的地址
        -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="onSelectFile"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <quill-editor
            ref="editorRef"
            theme="snow"
            v-model:content="formModel.content"
            contentType="html"
          >
          </quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onPublish('已发布')">发布</el-button>
        <el-button type="info" @click="onPublish('草稿')">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style lang="scss" scoped>
.editor :deep(.ql-container .ql-editor) {
  min-height: 200px !important;
}

.avatar-uploader .el-upload {
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-icon:hover {
  border-color: #409eff;
}

.el-icon {
  border: 1px dashed #d9d9d9;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

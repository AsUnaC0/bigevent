<script setup>
import { ref } from 'vue'
import {artEditChannelsService,artAddChannelsService} from '@/api/article'
const dialogVisible = ref(false)
const formRef = ref()
const formModel = ref({
    cate_name: '',
    cate_alias:''
})

const rules = {
    cate_name: [
        {
            required: true,
            message: '分类名称不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^\S{1,10}$/,
            message: '分类名称必须是1-10位的非空字符',
            trigger: 'blur'
        }
    ],
    cate_alias: [
        {
            required: true,
            message: '分类别名不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[a-zA-Z0-9]{1,15}$/,
            message: '分类别名必须是1-15位的字母或数字',
            trigger: 'blur'
        }
    ]
}

const emit=defineEmits(['success'])

const onSubmit = async () => {
    await formRef.value.validate()
    const isEdit = formModel.value.id
    if (isEdit) {
        await artEditChannelsService(formModel.value)
        ElMessage.success('编辑成功')
    }
    else {
        await artAddChannelsService(formModel.value)
        ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    emit('success')
}


// 组件对外暴露一个方法open ,基于open传来的参数，区分是添加还是编辑
// open({}) =>表单无需渲染 说明是添加
// open({id,name...}) =>表单需要渲染 说明是编辑
// open 调用后可以打开弹窗

const open = (row) => {
    console.log(row);
    dialogVisible.value = true
    formModel.value = {...row.row} //如果是添加就重置了表单内容 如果是编辑就存储了需要回显的数据
}

// 向外暴露一个方法
defineExpose({
    open
})
</script>


<template>
 <el-dialog
    v-model="dialogVisible"
    :title="`${formModel.id?'编辑':'添加'}分类`"
    width="30%">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px" padding-right="30px">
        <el-form-item label="分类名称" prop="cate_name">
            <el-input v-model="formModel.cate_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="分类别名" prop="cate_alias">
            <el-input v-model="formModel.cate_alias" placeholder="请输入分类别名"></el-input>
        </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onSubmit">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>
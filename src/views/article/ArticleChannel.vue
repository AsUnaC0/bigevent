<script setup>
import { artGetChannelsService,artDeleteChannelsService} from '@/api/article'
import { Delete, Edit} from '@element-plus/icons-vue'
import { ref } from 'vue'
import ChannelEdit from './componets/ChannelEdit.vue'
const channelList = ref([])
const loading = ref(false)
const dialog=ref()

const getChannelList = async () => {
    loading.value = true
    const res = await artGetChannelsService()
    channelList.value = res.data.data
    loading.value = false
        
}
getChannelList()

const onDelChannel = async (row) => {
    await ElMessageBox.confirm('你确定要删除吗?', '温馨提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    })
    await artDeleteChannelsService(row.id)
    ElMessage.success('删除成功')
    getChannelList()
}

const onEditChannel = (row) => {
    dialog.value.open({row})  
}

const onAddChannel = () => {
    dialog.value.open({})
}

const onSuccess = () => {
    getChannelList()
}

</script>

<template>
    <page-container title="文章分类">
        <template #extra>
            <el-button @click="onAddChannel">添加分类</el-button>
        </template>
        <el-table v-loading="loading" :data="channelList" style="width: 100%;">
            <el-table-column type="index" label="序号" width="100"></el-table-column>
            <el-table-column prop="cate_name" label="分类名称"></el-table-column>
            <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
            <el-table-column label="操作" width="150">
                <!-- row就是channelList中的每一项 $index 下标 -->
                <template #default="{row,$index}">
                    <el-button @click="onEditChannel(row,$index)" :icon="Edit" type="primary" circle plain></el-button>
                    <el-button @click="onDelChannel(row,$index)" :icon="Delete" type="danger" circle plain></el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty description="暂无数据"></el-empty>
            </template>
        </el-table>

        <channel-edit ref="dialog" @success="onSuccess"></channel-edit>

    </page-container>
</template>

<style lang="scss" scoped>
</style>
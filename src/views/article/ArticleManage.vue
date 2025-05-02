<script setup>
import { ref } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import ChannelSelect from './componets/ChannelSelect.vue'
import { artGetListService, artDelService } from '@/api/article'
import { formatTime } from '@/utils/format'
import ArticleEdit from './componets/ArticleEdit.vue'
import { ElMessage } from 'element-plus'
const articleList = ref([]) //文章列表
const total = ref(0) //总条数
const loading = ref(false) //loading状态

// 定义请求参数对象
const params = ref({
  pagenum: 1, //当前页
  pagesize: 2, //每页条数
  cate_id: '',
  state: ''
})

// 基于params参数 获取文章列表
const getArticleList = async () => {
  loading.value = true
  const res = await artGetListService(params.value)
  articleList.value = res.data.data
  total.value = res.data.total
  loading.value = false
}
getArticleList()

// 处理分页逻辑
const handleSizeChange = (size) => {
  // console.log(`每页 ${size} 条`);
  params.value.pagesize = size
  // 重新从第一页开始渲染
  params.value.pagenum = 1
  // 基于最新的params参数 获取文章列表
  getArticleList()
}

const handleCurrentChange = (page) => {
  // console.log(`当前页: ${page}`);
  params.value.pagenum = page
  // 基于最新的当前页数 获取文章列表
  getArticleList()
}

// 搜索逻辑=>按照最新条件重新检索，从第一页开始
const onSearch = () => {
  params.value.pagenum = 1
  getArticleList()
}

// 重置的逻辑 将筛选条件清空 从第一页开始
const onReset = () => {
  params.value.pagenum = 1
  params.value.cate_id = ''
  params.value.state = ''
  getArticleList()
}

const articleEditRef = ref()

// 添加逻辑
const onAddArticle = () => {
  articleEditRef.value.open({})
}

// 编辑逻辑
const onEdit = (row) => {
  articleEditRef.value.open(row)
}

// 删除逻辑
const onDel = async (row) => {
  await ElMessageBox.confirm('确认删除？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await artDelService(row.id)
  ElMessage.success('删除成功')
  getArticleList()
}

// 添加或者编辑成功的回调
const onSuccess = (type) => {
  if (type === 'add') {
    // 如果是添加就渲染最后一页
    const lastPage = Math.ceil((total.value + 1) / params.value.pagesize)
    // 更新最大页码数在渲染
    params.value.pagenum = lastPage
  }
  // 如果是编辑就渲染当前页
  getArticleList()
}
</script>

<template>
  <page-container title="文章管理">
    <template #extra>
      <el-button type="primary" @click="onAddArticle">添加文章</el-button>
    </template>

    <!-- 表单区域 -->
    <el-form inline>
      <el-form-item label="文章分类:">
        <!-- vue2=>v-model 是 :value和@input的简写 -->
        <!-- vue3=>v-model 是 :modelValue和@update:modelValue的简写 -->
        <ChannelSelect v-model="params.cate_id"></ChannelSelect>
      </el-form-item>
      <el-form-item label="发布状态:">
        <!-- 这里后台标记发布状态 就是通过中文标记的 已发布/草稿-->
        <el-select v-model="params.state">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch" type="primary">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <el-table :data="articleList" v-loading="loading">
      <el-table-column label="文章标题" prop="title">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="cate_name"></el-table-column>
      <el-table-column label="发表时间" prop="pub_date">
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <!-- 利用作用域插槽 row 可以获取当前行的数据 => 相当于v-for里面的item -->
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            circle
            plain
            type="primary"
            :icon="Edit"
            @click="onEdit(row)"
          ></el-button>
          <el-button
            circle
            plain
            type="danger"
            :icon="Delete"
            @click="onDel(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.pagenum"
      :page-sizes="[2, 3, 5, 10]"
      :page-size="params.pagesize"
      layout="jumper,total, sizes, prev, pager, next"
      :total="total"
      style="margin-top: 20px; justify-content: flex-end"
    >
    </el-pagination>

    <!-- 添加编辑的抽屉 -->
    <article-edit ref="articleEditRef" @success="onSuccess"></article-edit>
  </page-container>
</template>

<style lang="scss" scoped>
.el-select {
  width: 240px;
}
</style>

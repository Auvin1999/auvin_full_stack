# 快速启动新功能开发

这个技能将帮助你在若依微服务架构中快速添加一个新功能。

## 使用场景
当你需要添加一个新的业务功能时，使用这个技能可以快速生成所需的代码结构和基础实现。

## 步骤 1: 数据库设计

### 1.1 创建业务表
```sql
-- 示例：添加一个"产品管理"功能
CREATE TABLE `sys_product` (
  `product_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '产品ID',
  `product_code` varchar(50) NOT NULL COMMENT '产品编码',
  `product_name` varchar(100) NOT NULL COMMENT '产品名称',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `status` char(1) NOT NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) NOT NULL COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) NOT NULL COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uk_product_code` (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品信息表';
```

### 1.2 添加到系统菜单（可选）
通过 Nacos 配置或直接在数据库中添加菜单信息。

## 步骤 2: 后端开发

### 2.1 创建实体类
```java
// ruoyi-modules/ruoyi-system/src/main/java/com/ruoyi/system/domain/SysProduct.java
@Data
@TableName("sys_product")
public class SysProduct implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "product_id")
    private Long productId;

    @TableField("product_code")
    private String productCode;

    @TableField("product_name")
    private String productName;

    @TableField("category_id")
    private Long categoryId;

    @TableField("price")
    private BigDecimal price;

    @TableField("status")
    private String status;

    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    @TableField("remark")
    private String remark;
}
```

### 2.2 创建 Mapper 接口
```java
// ruoyi-modules/ruoyi-system/src/main/java/com/ruoyi/system/mapper/SysProductMapper.java
public interface SysProductMapper extends BaseMapper<SysProduct> {
}
```

### 2.3 创建 Service 层
```java
// Service 接口
public interface ISysProductService {
    IPage<SysProduct> selectProductPage(PageQuery query, SysProduct product);
    SysProduct selectProductById(Long productId);
    int insertProduct(SysProduct product);
    int updateProduct(SysProduct product);
    int deleteProductByIds(Long[] productIds);
}

// Service 实现类
@Service
public class SysProductServiceImpl implements ISysProductService {
    @Autowired
    private SysProductMapper productMapper;

    @Override
    public IPage<SysProduct> selectProductPage(PageQuery query, SysProduct product) {
        return productMapper.selectPage(query, product);
    }

    // ... 其他实现方法
}
```

### 2.4 创建 Controller
```java
// ruoyi-modules/ruoyi-system/src/main/java/com/ruoyi/system/controller/SysProductController.java
@RestController
@RequestMapping("/system/product")
public class SysProductController extends BaseController {
    @Autowired
    private ISysProductService productService;

    @GetMapping("/list")
    public TableDataInfo list(SysProduct product) {
        startPage();
        List<SysProduct> list = productService.selectProductList(product);
        return getDataTable(list);
    }

    @GetMapping("/{productId}")
    public AjaxResult getInfo(@PathVariable Long productId) {
        return success(productService.selectProductById(productId));
    }

    @PostMapping
    public AjaxResult add(@RequestBody SysProduct product) {
        return toAjax(productService.insertProduct(product));
    }

    @PutMapping
    public AjaxResult edit(@RequestBody SysProduct product) {
        return toAjax(productService.updateProduct(product));
    }

    @DeleteMapping("/{ids}")
    public AjaxResult remove(@PathVariable Long[] ids) {
        return toAjax(productService.deleteProductByIds(ids));
    }
}
```

## 步骤 3: 前端开发

### 3.1 Vue2 版本

#### 3.1.1 创建 API 文件
```javascript
// ruoyi-ui-vue2/src/api/system/product.js
import request from '@/utils/request'

// 查询产品列表
export function listProduct(query) {
  return request({
    url: '/system/product/list',
    method: 'get',
    params: query
  })
}

// 查询产品详细
export function getProduct(productId) {
  return request({
    url: '/system/product/' + productId,
    method: 'get'
  })
}

// 新增产品
export function addProduct(data) {
  return request({
    url: '/system/product',
    method: 'post',
    data: data
  })
}

// 修改产品
export function updateProduct(data) {
  return request({
    url: '/system/product',
    method: 'put',
    data: data
  })
}

// 删除产品
export function delProduct(productId) {
  return request({
    url: '/system/product/' + productId,
    method: 'delete'
  })
}
```

#### 3.1.2 创建 Vue 组件
```vue
<!-- ruoyi-ui-vue2/src/views/system/product/index.vue -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="产品状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:product:add']"
        >新增</el-button>
      </el-col>
      <!-- 更多按钮 -->
    </el-row>

    <el-table v-loading="loading" :data="productList">
      <el-table-column label="产品ID" align="center" prop="productId" />
      <el-table-column label="产品编码" align="center" prop="productCode" />
      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="价格" align="center" prop="price">
        <template #default="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:product:edit']"
          >修改</el-button>
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:product:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/system/product";

export default {
  name: "Product",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 产品表格数据
      productList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: null,
        status: null
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询产品列表 */
    getList() {
      this.loading = true;
      listProduct(this.queryParams).then(response => {
        this.productList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加产品";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const productId = row.productId;
      getProduct(productId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改产品";
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const productIds = row.productId || this.ids;
      this.$modal.confirm('是否确认删除产品编号为"' + productIds + '"的数据项？').then(function() {
        return delProduct(productIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 表单重置 */
    reset() {
      this.form = {
        productId: null,
        productCode: null,
        productName: null,
        categoryId: null,
        price: null,
        status: "0",
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
    }
  }
};
</script>
```

### 3.2 Vue3 版本（类似结构，使用 Composition API）

#### 3.2.1 API 文件（同 Vue2）
```javascript
// ruoyi-ui-vue3/src/api/system/product.js（内容相同）
```

#### 3.2.2 Vue 组件
```vue
<!-- ruoyi-ui-vue3/src/views/system/product/index.vue -->
<template>
  <!-- 模板部分同 Vue2 -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/system/product"
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDict } from '@/hooks/web/useDict'

const { dict_type } = useDict('sys_normal_disable')

// 数据定义
const loading = ref(true)
const productList = ref([])
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  productName: null,
  status: null
})

// 方法实现
const getList = async () => {
  loading.value = true
  const response = await listProduct(queryParams.value)
  productList.value = response.rows
  total.value = response.total
  loading.value = false
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('是否确认删除产品编号为"' + (row.productId || row.productName) + '"的数据项？', '警告', {
      type: 'warning'
    })
    await delProduct(row.productId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  getList()
})
</script>
```

## 步骤 4: 权限配置

### 4.1 后端权限
在对应的 Controller 方法上添加注解：
```java
@RequiresPermissions("system:product:list")
@GetMapping("/list")

@RequiresPermissions("system:product:query")
@GetMapping("/{productId}")

@RequiresPermissions("system:product:add")
@PostMapping

@RequiresPermissions("system:product:edit")
@PutMapping

@RequiresPermissions("system:product:remove")
@DeleteMapping("/{ids}")
```

### 4.2 前端权限
在模板中使用 `v-hasPermi` 指令：
```vue
<el-button v-hasPermi="['system:product:add']" type="primary" @click="handleAdd">新增</el-button>
```

## 步骤 5: 代码生成（推荐）

1. 登录前端系统（http://localhost:1024）
2. 访问 "代码生成" 页面
3. 导入新创建的表
4. 配置生成参数：
   - 包名：com.ruoyi.system
   - 模块名：ruoyi-system
   - 作者：yourname
   - 表前缀：sys_
5. 生成代码并下载
6. 解压到对应模块目录
7. 重启对应服务

## 注意事项

1. **微服务架构**：确认功能应该放在哪个模块中
2. **命名规范**：遵循项目的命名规范
3. **代码风格**：使用 ESLint 和 Prettier 统一代码风格
4. **注释**：添加必要的注释说明
5. **测试**：功能开发完成后进行测试

## 常见问题

**Q: 如何选择功能放在哪个模块？**
A: 参考 `ruoyi-modules` 下的模块划分，系统管理相关的放在 `ruoyi-system`，其他按功能划分。

**Q: 前端如何选择 Vue2 或 Vue3？**
A: 项目默认使用 Vue2，使用 `--vue3` 参数启动 Vue3 版本。

**Q: 如何实现文件上传？**
A: 参考 `ruoyi-file` 模块的实现，使用 `/file/upload` 接口。
# 技能：创建 CRUD 功能模块

## 描述

自动创建一个完整的 CRUD（增删改查）功能模块，包括：
- 后端：Domain、Mapper、Service、Controller
- 前端：API 文件、Vue 页面组件
- 数据库：建表 SQL

## 使用场景

当需要添加一个新的业务模块，如"商品管理"、"订单管理"等。

## 执行步骤

### 1. 设计数据库表

```sql
CREATE TABLE `sys_product` (
  `product_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '产品ID',
  `product_name` VARCHAR(50) NOT NULL COMMENT '产品名称',
  `product_code` VARCHAR(50) NOT NULL COMMENT '产品编码',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `stock` INT(11) NOT NULL DEFAULT '0' COMMENT '库存',
  `status` CHAR(1) NOT NULL DEFAULT '0' COMMENT '状态',
  `create_by` VARCHAR(64) DEFAULT '' COMMENT '创建者',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT '' COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`product_id`)
) ENGINE=INNODB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='产品表';
```

### 2. 创建后端 Domain

```java
// ruoyi-system/src/main/java/com/ruoyi/system/domain/SysProduct.java
package com.ruoyi.system.domain;

import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

public class SysProduct extends BaseEntity {
    private static final long serialVersionUID = 1L;

    private Long productId;

    @Excel(name = "产品名称")
    private String productName;

    @Excel(name = "产品编码")
    private String productCode;

    @Excel(name = "价格")
    private java.math.BigDecimal price;

    @Excel(name = "库存")
    private Integer stock;

    @Excel(name = "状态")
    private String status;

    // getter 和 setter 方法
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public java.math.BigDecimal getPrice() { return price; }
    public void setPrice(java.math.BigDecimal price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
```

### 3. 创建后端 Mapper

```java
// ruoyi-system/src/main/java/com/ruoyi/system/mapper/SysProductMapper.java
package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.SysProduct;

public interface SysProductMapper {
    List<SysProduct> selectProductList(SysProduct product);
    SysProduct selectProductById(Long productId);
    int insertProduct(SysProduct product);
    int updateProduct(SysProduct product);
    int deleteProductById(Long productId);
    int deleteProductByIds(Long[] productIds);
}
```

```xml
<!-- ruoyi-system/src/main/resources/mapper/system/SysProductMapper.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.system.mapper.SysProductMapper">

    <resultMap type="SysProduct" id="SysProductResult">
        <id property="productId" column="product_id"/>
        <result property="productName" column="product_name"/>
        <result property="productCode" column="product_code"/>
        <result property="price" column="price"/>
        <result property="stock" column="stock"/>
        <result property="status" column="status"/>
        <result property="createBy" column="create_by"/>
        <result property="createTime" column="create_time"/>
        <result property="updateBy" column="update_by"/>
        <result property="updateTime" column="update_time"/>
        <result property="remark" column="remark"/>
    </resultMap>

    <sql id="selectProductVo">
        SELECT product_id, product_name, product_code, price, stock, status,
               create_by, create_time, update_by, update_time, remark
        FROM sys_product
    </sql>

    <select id="selectProductList" parameterType="SysProduct" resultMap="SysProductResult">
        <include refid="selectProductVo"/>
        <where>
            <if test="productName != null and productName != ''">
                AND product_name LIKE CONCAT('%', #{productName}, '%')
            </if>
            <if test="productCode != null and productCode != ''">
                AND product_code = #{productCode}
            </if>
            <if test="status != null and status != ''">
                AND status = #{status}
            </if>
        </where>
        ORDER BY product_id DESC
    </select>

    <select id="selectProductById" parameterType="Long" resultMap="SysProductResult">
        <include refid="selectProductVo"/>
        WHERE product_id = #{productId}
    </select>

    <insert id="insertProduct" parameterType="SysProduct">
        INSERT INTO sys_product (
            product_name, product_code, price, stock, status,
            create_by, create_time, remark
        ) VALUES (
            #{productName}, #{productCode}, #{price}, #{stock}, #{status},
            #{createBy}, SYSDATE(), #{remark}
        )
    </insert>

    <update id="updateProduct" parameterType="SysProduct">
        UPDATE sys_product
        <set>
            <if test="productName != null and productName != ''">product_name = #{productName},</if>
            <if test="productCode != null and productCode != ''">product_code = #{productCode},</if>
            <if test="price != null">price = #{price},</if>
            <if test="stock != null">stock = #{stock},</if>
            <if test="status != null">status = #{status},</if>
            <if test="updateBy != null">update_by = #{updateBy},</if>
            update_time = SYSDATE(),
            <if test="remark != null">remark = #{remark},</if>
        </set>
        WHERE product_id = #{productId}
    </update>

    <delete id="deleteProductById" parameterType="Long">
        DELETE FROM sys_product WHERE product_id = #{productId}
    </delete>

    <delete id="deleteProductByIds" parameterType="Long">
        DELETE FROM sys_product WHERE product_id IN
        <foreach item="productId" collection="array" open="(" separator="," close=")">
            #{productId}
        </foreach>
    </delete>

</mapper>
```

### 4. 创建后端 Service

```java
// ruoyi-system/src/main/java/com/ruoyi/system/service/ISysProductService.java
package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.SysProduct;

public interface ISysProductService {
    List<SysProduct> selectProductList(SysProduct product);
    SysProduct selectProductById(Long productId);
    int insertProduct(SysProduct product);
    int updateProduct(SysProduct product);
    int deleteProductByIds(Long[] productIds);
}
```

```java
// ruoyi-system/src/main/java/com/ruoyi/system/service/impl/SysProductServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.SysProductMapper;
import com.ruoyi.system.domain.SysProduct;
import com.ruoyi.system.service.ISysProductService;

@Service
public class SysProductServiceImpl implements ISysProductService {

    @Autowired
    private SysProductMapper productMapper;

    @Override
    public List<SysProduct> selectProductList(SysProduct product) {
        return productMapper.selectProductList(product);
    }

    @Override
    public SysProduct selectProductById(Long productId) {
        return productMapper.selectProductById(productId);
    }

    @Override
    public int insertProduct(SysProduct product) {
        return productMapper.insertProduct(product);
    }

    @Override
    public int updateProduct(SysProduct product) {
        return productMapper.updateProduct(product);
    }

    @Override
    public int deleteProductByIds(Long[] productIds) {
        return productMapper.deleteProductByIds(productIds);
    }
}
```

### 5. 创建后端 Controller

```java
// ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysProductController.java
package com.ruoyi.web.controller.system;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.system.domain.SysProduct;
import com.ruoyi.system.service.ISysProductService;

@RestController
@RequestMapping("/system/product")
public class SysProductController extends BaseController {

    @Autowired
    private ISysProductService productService;

    @PreAuthorize("@ss.hasPermi('system:product:list')")
    @GetMapping("/list")
    public TableDataInfo list(SysProduct product) {
        startPage();
        List<SysProduct> list = productService.selectProductList(product);
        return getDataTable(list);
    }

    @PreAuthorize("@ss.hasPermi('system:product:export')")
    @Log(title = "产品管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, SysProduct product) {
        List<SysProduct> list = productService.selectProductList(product);
        ExcelUtil<SysProduct> util = new ExcelUtil<>(SysProduct.class);
        util.exportExcel(response, list, "产品数据");
    }

    @PreAuthorize("@ss.hasPermi('system:product:query')")
    @GetMapping(value = "/{productId}")
    public AjaxResult getInfo(@PathVariable("productId") Long productId) {
        return success(productService.selectProductById(productId));
    }

    @PreAuthorize("@ss.hasPermi('system:product:add')")
    @Log(title = "产品管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody SysProduct product) {
        product.setCreateBy(getUsername());
        return toAjax(productService.insertProduct(product));
    }

    @PreAuthorize("@ss.hasPermi('system:product:edit')")
    @Log(title = "产品管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody SysProduct product) {
        product.setUpdateBy(getUsername());
        return toAjax(productService.updateProduct(product));
    }

    @PreAuthorize("@ss.hasPermi('system:product:remove')")
    @Log(title = "产品管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{productIds}")
    public AjaxResult remove(@PathVariable Long[] productIds) {
        return toAjax(productService.deleteProductByIds(productIds));
    }
}
```

### 6. 创建前端 API

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

// 导出产品
export function exportProduct(query) {
  return request({
    url: '/system/product/export',
    method: 'post',
    params: query
  })
}
```

### 7. 创建前端页面

```vue
<!-- ruoyi-ui-vue2/src/views/system/product/index.vue -->
<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:product:add']">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="productList">
      <el-table-column label="产品ID" prop="productId" />
      <el-table-column label="产品名称" prop="productName" />
      <el-table-column label="产品编码" prop="productCode" />
      <el-table-column label="价格" prop="price" />
      <el-table-column label="库存" prop="stock" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleUpdate(scope.row)" v-hasPermi="['system:product:edit']">修改</el-button>
          <el-button size="small" @click="handleDelete(scope.row)" v-hasPermi="['system:product:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model="form.stock" placeholder="请输入库存" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProduct, getProduct, addProduct, updateProduct, delProduct } from "@/api/system/product";

export default {
  name: "Product",
  data() {
    return {
      loading: false,
      productList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: null
      },
      title: "",
      open: false,
      form: {},
      rules: {
        productName: [{ required: true, message: "产品名称不能为空", trigger: "blur" }],
        productCode: [{ required: true, message: "产品编码不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listProduct(this.queryParams).then(response => {
        this.productList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加产品";
    },
    handleUpdate(row) {
      this.reset();
      const productId = row.productId || this.ids;
      getProduct(productId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改产品";
      });
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.productId != null) {
            updateProduct(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProduct(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const productIds = row.productId || this.ids;
      this.$modal.confirm('是否确认删除产品编号为"' + productIds + '"的数据项?').then(() => {
        return delProduct(productIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        productId: null,
        productName: null,
        productCode: null,
        price: null,
        stock: null
      };
      this.resetForm("form");
    }
  }
};
</script>
```

### 8. 配置菜单权限

登录系统后台：
1. 系统管理 → 菜单管理 → 新增
2. 配置产品管理菜单
3. 分配权限给角色

## 快捷方式

**使用代码生成器**（推荐）：

1. 访问 http://localhost:8080/tool/gen
2. 导入数据库表
3. 配置生成信息
4. 点击生成代码
5. 下载并解压到项目

代码生成器会自动生成所有上述代码！

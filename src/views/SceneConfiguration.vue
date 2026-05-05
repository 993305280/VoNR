<template>
  <div class="page-container">
    <h2 class="page-title">业务场景定制</h2>

    <div class="form-card">
      <el-form label-position="left" label-width="110px">
        
        <div class="section">
          <div class="section-header">
            <span class="indicator"></span>
            <span class="section-title">基础信息配置</span>
          </div>
          
          <div class="form-row">
            <el-form-item label="业务场景" required class="flex-item">
              <el-select v-model="formData.businessScene" placeholder="001趣味通话" class="w-full">
                <el-option label="001趣味通话" value="001" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="子业务场景" required class="flex-item">
              <el-select v-model="formData.subScene" placeholder="请选择子业务场景" class="w-full">
                <el-option label="子场景1" value="1" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="计费套餐" required class="flex-item">
              <div class="link-input-wrapper">
                <el-input v-model="formData.plan" placeholder="请关联计费套餐" />
                <el-icon class="link-icon"><Link /></el-icon>
              </div>
            </el-form-item>
          </div>

          <el-form-item label="场景配置说明">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入"
              class="custom-textarea"
            />
          </el-form-item>
        </div>

        <div class="section mt-30">
          <div class="section-header">
            <span class="indicator"></span>
            <span class="section-title">功能类型配置</span>
          </div>

          <div class="function-config-header">
            <el-form-item label="功能类型" required class="mb-0">
              <el-radio-group v-model="formData.functionType">
                <el-radio label="material">素材</el-radio>
                <el-radio label="effects">特效</el-radio>
                <el-radio label="subtitle">字幕</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-button type="primary" class="add-btn">
              <el-icon><Plus /></el-icon>添加关联素材
            </el-button>
          </div>

          <div class="table-wrapper">
            <el-table :data="tableData" style="width: 100%" header-row-class-name="custom-header">
              <el-table-column prop="isDefault" label="是否默认" />
              <el-table-column prop="name" label="素材名称" />
              <el-table-column prop="content" label="文本内容" />
              <el-table-column prop="format" label="文件格式" />
              <el-table-column prop="size" label="文件大小" />
              <el-table-column prop="desc" label="素材说明" />
              <el-table-column label="操作" width="100" />
            </el-table>
          </div>
        </div>
      </el-form>
    </div>

    <div class="footer-actions">
      <el-button class="reset-btn">重置</el-button>
      <el-button type="primary" class="save-btn">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Link, Plus } from '@element-plus/icons-vue'

const formData = reactive({
  businessScene: '001',
  subScene: '',
  plan: '',
  description: '',
  functionType: 'material'
})

const tableData = ref([]) // 初始为空，对应图中空白状态
</script>

<style lang="scss" scoped>
.page-container {
  padding: 24px;
  background-color: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;

  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
    margin-top: 0;
  }

  .form-card {
    padding: 0 10px;
  }

  // 小蓝色竖线指示器
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .indicator {
      width: 3px;
      height: 14px;
      background-color: #2b6de5;
      margin-right: 8px;
    }

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
  }

  .form-row {
    display: flex;
    gap: 40px;
    margin-bottom: 10px;

    .flex-item {
      flex: 1;
      margin-bottom: 22px;
    }
  }

  .w-full {
    width: 100%;
  }

  .mt-30 {
    margin-top: 30px;
  }

  // 计费套餐输入框带链接图标
  .link-input-wrapper {
    position: relative;
    width: 100%;
    
    .link-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #2b6de5;
      cursor: pointer;
      z-index: 1;
    }
    
    :deep(.el-input__inner) {
      padding-right: 30px;
    }
  }

  // 文本域样式自定义
  .custom-textarea {
    :deep(.el-textarea__inner) {
      background-color: #fff;
      border-color: #e4e7ed;
      &:focus {
        border-color: #2b6de5;
      }
    }
  }

  // 功能类型头部
  .function-config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .mb-0 {
      margin-bottom: 0;
    }

    .add-btn {
      background-color: #4079de;
      border-color: #4079de;
      height: 32px;
      padding: 0 15px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }

  // 表格样式
  .table-wrapper {
    border: 1px solid #f0f2f5;
    border-radius: 4px;

    :deep(.custom-header) {
      th {
        background-color: #f8f9fb !important;
        color: #909399;
        font-weight: normal;
        font-size: 13px;
        height: 44px;
        border-bottom: none;
      }
    }
  }

  // 底部动作按钮
  .footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 60px;
    padding-bottom: 40px;

    .reset-btn {
      width: 96px;
      height: 36px;
      background-color: #edf2fc;
      border: none;
      color: #4079de;
      
      &:hover {
        background-color: #e1eaff;
      }
    }

    .save-btn {
      width: 96px;
      height: 36px;
      background-color: #4079de;
      border-color: #4079de;
    }
  }

  // 覆盖 Element Plus 默认样式以匹配图片
  :deep(.el-form-item__label) {
    color: #333;
    font-size: 13px;
  }
  
  :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 1px #e4e7ed inset;
  }
}
</style>
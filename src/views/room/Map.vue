<template>
  <a-card>
    <div slot="title">
      <div class="status-label">
        <div class="label">
          <div class="point-status on"></div>
          <span>开</span>
        </div>
        <div class="label">
          <div class="point-status off"></div>
          <span>关</span>
        </div>
        <div class="label">
          <div class="point-status"></div>
          <span>无设备</span>
        </div>
      </div>
    </div>
    <div slot="extra">
      <a-button size="small" type="primary" icon="el-icon-refresh" :disabled="isEditing" @click="handleRefresh()">刷新</a-button>
      <!-- <a-upload
        v-isPermited="48"
        class="upload-btn"
        :disabled="isEditing"
        :data="uploadData"
        :show-file-list="false"
        accept=".png, .jpg, .jpeg"
        :before-upload="onBeforeUpload"
        :on-success="onUploadSuccess"
        :on-error="onUploadFail"
        action="/consumer/image/uploadSchoolMap"
      >
        <a-button size="small" type="primary" icon="el-icon-upload">
          上传配置图
          <a-tooltip placement="top" effect="dark">
            <div slot="content" class="question">
              <p>请上传规格为1080x720的图片</p>
              <p>图片格式仅支持jpg/jpeg/png</p>
            </div>
            <i class="el-icon-question"></i>
          </a-tooltip>
        </a-button>
      </a-upload> -->
      <a-button size="small" type="primary" icon="el-icon-edit" :disabled="isEditing" @click="handleEdit()">编辑</a-button>
    </div>
    <p>card content</p>
    <p>card content</p>
    <p>card content</p>
  </a-card>
</template>

<script>
import graph from '../../assets/images/1080x720.png'
export default {
  data () {
    return {
      graph: graph,
      uploadData: {
        access_token: ''
      },
      radius: 20,
      points: [],
      editPoint: {
        x: -1000,
        y: -1000
      },
      buildingOptions: [],
      buildProps: {
        value: 'id',
        label: 'name'
      },
      selectedOptions: [],
      isAdd: false,
      isAddFinished: false,
      isSetLocation: false,
      isEditing: false,
      dialogVisible: false,
      currentDialogTitle: '',
      activePoint: {},
      activePointIndex: '',
      curRoomDeviceList: [],
      sidebarLoading: false
    }
  },
}
</script>

<style lang="less" scoped>
.status-label{
  // position: absolute;
  // left: 10px;
  // bottom: 4px;
  .label{
    display: inline-block;
    padding: 0 10px;
  }
  span{
    display: inline-block;
    padding: 5px;
    color: #999;
    font-size: 12px;
  }
}
.point-status{
  display: inline-block;
  background-color: #a9a6a6;
  border: 1px solid #333;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  vertical-align: sub;
  &.on{
    background-color: #1fe650;
  }
  &.off{
    background-color: rgb(223, 45, 45);
  }
}
</style>

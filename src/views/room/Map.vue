<template>
  <a-card class="map-wrapper" :style="{height: height + 'px'}">
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
    <div slot="extra" class="extra">
      <a-button type="primary" icon="sync" :disabled="isEditing" @click="handleRefresh()" title="刷新"></a-button>
      <a-upload
        v-isPermitted="'room:map:upload'"
        class="upload-btn"
        name="file"
        :showUploadList="false"
        :headers="headers"
        :disabled="isEditing"
        accept=".png, .jpg, .jpeg"
        action="/image/uploadSchoolMap"
        :before-upload="onBeforeUpload"
        @change="onUploadChange"
      >
        <a-tooltip placement="top" effect="dark">
          <div slot="title" class="question">
            <p>请上传规格为1080x720的图片</p>
            <p>图片格式仅支持jpg/jpeg/png</p>
          </div>
          <!-- <a-icon type="question-circle" />上传配置图 -->
          <a-button icon="upload" type="primary"></a-button>
        </a-tooltip>
        <!-- <a-button icon="upload" type="primary">上传配置图</a-button> -->
      </a-upload>
      <a-button v-isPermitted="'room:map:edit'" type="primary" icon="edit" :disabled="isEditing" @click="handleEdit()" title="编辑"></a-button>
    </div>
    <div class="map-content">
      <a-spin :spinning="contentSpinning" :tip="contentSpinTips">
        <div class="image-wrapper" @mouseenter="onMouseEnter" @mousedown="onMouseDown" @mouseleave="onMouseLeave" @mouseup="onMouseUp">
          <img :src="graph" alt="">
          <a-tooltip placement="top" v-for="(item, index) in points" :key="index">
            <div slot="title">
              <p style="padding: 5px; font-size: 16px; text-align: center;">{{ `${item.buildingName || '-'}楼${item.floorName || '-'}层${item.roomName || '-'}` }}</p>
              <p style="padding: 5px; color: #f2f2f2; text-align: center;">{{ `开关-${parseBuildingLabel(item.deviceState)}` }}</p>
            </div>
            <div class="point" :style="{left: item.x + 'px', top: item.y + 'px', background: parseBuildingBackground(item.deviceState)}" @click="handlePoint(item, index)"></div>
          </a-tooltip>
          <div v-if="isAdd" class="point edit" :style="{left: editPoint.x + 'px', top: editPoint.y + 'px'}"></div>
          <div v-if="isAddFinished && !isSetLocation" class="cascader" :style="{left: (editPoint.x + this.radius) + 'px', top: (editPoint.y + this.radius) + 'px'}">
            <a-icon type="close-circle" @click="handleCancelAdd" title="取消" />
            <a-cascader v-model="selectedOptions" :options="buildingOptions" placeholder="选择位置" @change="handleChange"></a-cascader>
          </div>
        </div>
      </a-spin>
    </div>
    <map-modal ref="modalForm" @ok="modalFormOk" @close="modalFormOk"></map-modal>
  </a-card>
</template>

<script>
import graph from '../../assets/images/1080x720.png'
import { getPointList, createPoint, getMapInfo} from '@/api/map'
import { getRoomCascader } from '@/api/room'
import { buildRoomCascaderTree } from '@/utils/util'
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { mapGetters } from 'vuex'

import MapModal from './modules/MapModal'
export default {
  name: 'Map',
  components: { MapModal },
  mixins: [ProListMixin],
  data () {
    return {
      graph: graph,
      headers: {
        'X-Access-Token': ''
      },
      radius: 20,
      points: [],
      editPoint: {
        x: -1000,
        y: -1000
      },
      buildingOptions: [],
      selectedOptions: [],
      isAdd: false,
      isAddFinished: false,
      isSetLocation: false,
      isEditing: false,
      currentDialogTitle: '',
      activePoint: {},
      activePointIndex: '',
      curRoomDeviceList: [],
      sidebarLoading: false,

      contentSpinning: false,
      contentSpinTips: '',
      height: 800
    }
  },
  mounted () {
    this.initLayout()
    this.$bus.$on('state', () => this.getMapPoints())
  },
  computed: {
    ...mapGetters([
      'token'
    ]),
  },
  methods: {
    initLayout () {
      const winH = document.body.clientHeight
      const navHeader = 64
      const tab = 40
      this.height = winH - navHeader - tab - 40
    },
    loadData () {
      this.initMapInfo()
      this.getRoomCascader()
      this.getMapPoints()
      this.headers['X-Access-Token'] = this.token
    },
    getRoomCascader () {
      getRoomCascader().then(res => {
        this.buildingOptions = buildRoomCascaderTree(res.result.records)
      })
    },
    getMapPoints () {
      this.contentSpinning = false
      getPointList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.points = res.result.records
        }
       this.contentSpinning = false
      }).catch(() => this.contentSpinning = false)
    },
    initMapInfo () {
      getMapInfo().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.graph = res.result.records
        }
      })
    },
    setSpinning (bool = true, text = '') {
       this.contentSpinning = bool
       this.contentSpinTips = text
    },
    isBuildingActive (status) {
      return status && status.slice(0, 2) !== '00'
    },
    parseBuildingBackground (status) {
      // if (!status) return '#a9a6a6'
      // return status.slice(0, 2) !== '00' ? '#1fe650' : 'rgb(223, 45, 45)'
      if (status === '') return '#a9a6a6'
      return status === '1' ? '#1fe650' : 'rgb(223, 45, 45)'
    },
    parseBuildingLabel (status) {
      // if (!status) return '无设备'
      // return status.slice(0, 2) !== '00' ? '开' : '关'
      if (status === '') return '无设备'
      return status === '1' ? '开' : '关'
    },
    handleEdit () {
      this.isAdd = true
      this.isAddFinished = false
      this.isEditing = true
    },
    handleRefresh () {
      this.getMapPoints()
    },
    handleChange (value) {
      if (!value || !value.length) return
      this.setSpinning(true, '位置设置中..')
      const point = this.points.pop()
      createPoint(value[2], point.x, point.y).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.isSetLocation = true
          this.$message.success('设置成功')
          this.getMapPoints()
        } else if (res.status === 600) {
          this.isSetLocation = true
          this.$message.error('该教室已存在')
        } else {
          this.$message.error(res.message)
          this.points.push(point)
        }
        this.setSpinning(false, '')
        this.isEditing = false
      })
      this.selectedOptions = []
    },
    handlePoint (point, index) {
      if (!this.isAdd) {
        this.activePoint = point
        this.$refs.modalForm.edit({...point, index})
      }
    },
    handleCancelAdd () {
      this.isAdd = false
      this.isSetLocation = false
      this.isAddFinished = false
      this.points.pop()
      this.editPoint = {
        x: -1000,
        y: -1000
      }
      this.isEditing = false
    },
    onMouseEnter () {
      if (!this.isAdd) return
      const that = this
      document.querySelector('.image-wrapper').onmousemove = function (e) {
        const event = e || window.event
        event.preventDefault()
        event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true)

        if (!that.isAdd) return
        const offsetLeft = this.offsetLeft
        const offsetTop = this.offsetTop
        // 滚动条
        const wrapper = document.querySelector('.map-wrapper')
        const content = document.querySelector('.map-content')
        const x = event.clientX - offsetLeft + content.scrollLeft // - 20
        const y = event.clientY - offsetTop + wrapper.scrollTop // - 102
        if (event.offsetX < 0 || event.offsetY < 0 || x > (1080 - that.radius) || y > (720 - that.radius)) return false
        that.editPoint.x = x
        that.editPoint.y = y
      }
    },
    onMouseDown () {
      if (!this.isAdd) return
      this.points.push({...this.editPoint})
      this.isAddFinished = false
    },
    onMouseLeave () {
      if (this.isAddFinished) return
      document.querySelector('.image-wrapper').onmousemove = null
    },
    onMouseUp () {
      if (this.isAddFinished) return
      // 教室交集
      const hasCross = this.points.slice(0, -1).find(point => {
        return this.isCross(point, this.editPoint)
      })
      if (hasCross) {
        this.$message.warning('已存在')
        this.points.pop()
        return
      }
      document.querySelector('.image-wrapper').onmousemove = null
      this.isAdd = false
      this.isAddFinished = true
      this.isSetLocation = false
    },
    isCross (point1, point2) {
      const w = this.radius
      return point1.x + w > point2.x && point1.x < point2.x + w && point1.y + w > point2.y && point1.y < point2.y + w
    },
    onBeforeUpload (file) {
      const suffix = file.name ? file.name.slice(file.name.lastIndexOf('.') + 1) : ''
      if (!['png', 'jpg', 'jpeg'].includes(suffix.toLowerCase())) {
        this.$message.error('图片格式仅支持jpg/jpeg/png')
        return false
      }
      this.setSpinning()
    },
    onUploadChange (info) {
      // if (info.file.status !== 'uploading') {
      //   console.log(info.file, info.fileList);
      // }
      const { response } = info.file
      if (info.file.status === 'done') {
        this.graph = response.result.picurl
        this.setSpinning(false)
        this.$message.success('上传成功')
      } else if (info.file.status === 'error') {
        this.setSpinning(false)
        this.$message.error('上传失败')
      }
    },
    // onUploadSuccess (response) {
    //   this.graph = response.data.picurl
    //   this.setSpinning(false)
    // },
    // onUploadFail () {
    //   this.setSpinning(false)
    //   this.$message({
    //     type: 'error',
    //     message: '上传失败'
    //   })
    // },
    onSwitcherChange () {
      setTimeout(() => {
        this.getMapPoints()
      }, 2000)
    },
    modalClose () {
      this.loadData()
    }
  },
}
</script>

<style lang="less" scoped>
.map-wrapper{
  overflow-y: auto;

  .upload-btn{
    display: inline-block;
    position: relative;
    button{
      // height: 24px;
    }
  }
  .ant-btn{
    margin-left: 10px;
  }
  .ant-btn > span i{
    position: absolute;
    top: -2px;
    right: 0;
    color: #fff;
    font-size: 16px;
  }

  .status-label{
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

  .map-content{
    // position: relative;
    text-align: center;
    margin-top: 10px;
    overflow: auto;

    .image-wrapper{
      position: relative;
      display: inline-block;
      user-select: none;
      overflow: hidden;
      width: 1080px;
      height: 720px;
      max-height: 720px;
      max-width: 1080px;
      > img{
        max-width: 100%;
        max-height: 100%;
      }
    }
    .point{
      display: inline-block;
      position: absolute;
      background-color: rgb(223, 45, 45);
      border: 1px solid #333;
      border-radius: 100%;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .cascader {
      position: absolute;
      padding: 10px;
      background: #fff;
      border-radius: 0 20px 20px 20px;
      box-shadow: 0 0 2px 0px #999;
      i{
        position: absolute;
        right: -2px;
        top: -2px;
        background-color: #000;
        color: #fff;
        border-radius: 50%;
        padding: 0px;
        cursor: pointer;
      }
    }
  }
}
// .anticon-question-circle{
//   position: absolute;
//   top: -2px;
//   right: 0;
//   color: #fff;
//   font-size: 16px;
// }
.question{
  padding: 2px;
  text-align: center;
  font-size: 14px;
  color: #A2AAB5;
  font-family: Consolas;
  p{
    padding: 3px;
  }
  p:last-of-type{
    font-size: 12px;
  }
}
</style>
<style lang="less">
.map-wrapper{
  .ant-card-body{
    padding: 0;
  }
  &,
  .ant-spin-nested-loading,
  .ant-spin-container{
    position: initial;
  }
}

</style>

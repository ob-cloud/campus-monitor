<template>
  <div class="building ui-container">
    <a-card>
      <div slot="title" class="search-bar">
        <div class="caption">
          <a-input clearable class="caption-item" @keyup.enter.native="handleSearch" v-model="queryParam.buildName" placeholder="楼栋"></a-input>
          <a-input clearable class="caption-item" @keyup.enter.native="handleSearch" v-model="queryParam.floorName" placeholder="楼层"></a-input>
          <a-button type="primary" icon="el-icon-search" @click="handleSearch">查询</a-button>
        </div>
      </div>
      <div slot="extra">
        <a-button-group>
          <a-button type="primary" icon="reload" title="刷新" @click="handleRefresh"></a-button>
          <a-button type="primary" icon="plus" title="添加" @click="handleAdd"></a-button>
          <a-popconfirm :title="`${powerText}电源?`" @confirm="handleAllPower">
            <a-button type="primary" icon="poweroff" title="开关"></a-button>
          </a-popconfirm>

        </a-button-group>
      </div>
      <div class="block-list">
        <div class="block-item" v-for="item in dataList" :key="item.id">
          <div class="toolbar">
            <a-popconfirm :title="`${item.allType ? '关闭' : '开启'}楼层电源?`" @confirm="() => handlePower(item)">
              <i class="icon obicon obicon-power" title="电源"></i>
            </a-popconfirm>
            <a-icon class="icon" type="edit" title="编辑" @click="handleEdit(item)" />
            <a-popconfirm title="确定删除吗?" @confirm="() => handleRemove(item.id)">
              <a-icon class="icon" type="delete" />
            </a-popconfirm>
          </div>
          <div class="content">
            <i class="building-sign obicon obicon-building" :class="{'is-active': item.allType}"></i>
            <p class="text">
              {{ item.buildingName }}栋{{ item.floorName }}层
            </p>
          </div>
        </div>
      </div>
      <floor-modal ref="modalForm" @ok="modalFormOk"></floor-modal>
    </a-card>
  </div>
</template>

<script>
import { getFloorList, delFloor, handleLampPower, getPowerStatus, triggerAllPower } from '@/api/room'
import { ProListMixin } from '@/utils/mixins/ProListMixin'

import FloorModal from './modules/FloorModal'
export default {
  components: { FloorModal },
  mixins: [ProListMixin],
  data () {
    return {
      loading: false,
      containerHeight: 500,
      dataList: [],
      queryParam: {
      },
      buildingTotal: 0,
      powerText: ''
    }
  },
  mounted () {
    // Helper.windowOnResize(this, this.fixLayout)
  },
  methods: {
    loadData () {
      this.getDataList()
    },
    fixLayout () {
      // this.containerHeight = Helper.calculateTableHeight() - 20
    },
    getDataList () {
      this.loading = true
      getFloorList(this.queryParam).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataList = res.result.records
        }
      })
    },
    handleDeviceModal (item) {
      this.$refs.deviceModal.show(item)
    },
    isLightActive (status) {
      if (!status) return false
      const state = status.slice(0, 2)
      return state !== '00'
    },
    handleRefresh () {
      this.loadData()
    },
    handleSearch () {
      this.loadData()
    },
    handlePower (item) {
      const isPowerOn = this.isLightActive(item.deviceState)
      const params = {
        roomId: item.id,
        deviceType: isPowerOn ? 2 : 1
      }
      handleLampPower(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData()
        }
      })
    },
    async handleAllPower () {
      const res = await getPowerStatus()
      if (this.$isAjaxSuccess(res.code)) {
        this.powerText = res.result ? '关闭' : '开启'
      }
      triggerAllPower(+!res.data ? 1 : 2).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData()
        }
      })
    },
    handleRemove (id) {
      delFloor(id).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData()
        }
      })
    }
  },
}
</script>

<style lang="less" scoped>
.search-bar{
  padding: 10px;
  .caption::before,
  .caption::after{
    content: " ";
    visibility: hidden;
    width: 1px;
    height: 1px;
    clear: both;
  }
  .caption.is-right{
    float: right;
  }
  .caption .el-button-group .el-button{
    padding: 3px 8px;
  }

  .caption-item{
    width: 200px;
    margin-right: 12px;
  }
}
.block-list{
  position: relative;
  // padding-right: 70px;
  overflow: auto;
  .pagination{
    display: inline-block;
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 6px;
    box-shadow: 0 0 1px 1px #f2f2f2;
    background: #fff;
    padding: 0;
    width: 60px;
  }
}
.block-item{
  position: relative;
  display: inline-block;
  padding: 20px;
  background: #fff;
  margin: 10px;
  width: 190px;
  height: 142px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0px 0px 3px 1px #c0c4cc;

  .toolbar{
    position: absolute;
    right: 5px;
    top: 5px;
    .icon{
      font-size: 14px;
      padding: 5px;
      cursor: pointer;
      color: #999;
      transition: all .3s;

      &:hover{
        color: #000;
      }
      & + .icon{
        right: 5px;
      }
    }
  }
  .content{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
  .building-sign{
    display: inline-block;
    color: #bdbdbd;
    font-size: 50px;
    padding: 5px;

    &.is-active{
      color: #d8d815;
    }
  }
  .text{
    font-size: 14px;
    display: inline-block;
    margin-left: 5px;
  }
}
.ob-form{
 width: 80%;
 margin: 0 auto;
 .el-select,
 .el-input{
   width: 300px;
 }
}
</style>
<style lang="less">
.block-list{
  .pagination > button{
    display: block;
    padding: 5px 10px;
    height: 40px;
    background-color: transparent;
    &:last-of-type{
      border-top: 1px solid #eee;
    }
  }
}
</style>

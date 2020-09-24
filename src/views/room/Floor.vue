<template>
  <div class="building ui-container">
    <a-card>
      <div slot="title" class="search-bar">
        <div class="caption">
          <a-input allowClear class="caption-item" @keyup.enter.native="handleSearch" v-model="queryParam.buildName" placeholder="楼栋"></a-input>
          <a-input allowClear class="caption-item" @keyup.enter.native="handleSearch" v-model="queryParam.floorName" placeholder="楼层"></a-input>
          <a-button type="primary" @click="handleSearch" icon="search">查询</a-button>
          <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
        </div>
      </div>
      <div slot="extra">
        <a-button-group>
          <a-button type="primary" icon="reload" title="刷新" @click="handleRefresh"></a-button>
          <a-button v-isPermitted="'room:floor:add'" type="primary" icon="plus" title="添加" @click="handleAdd"></a-button>
          <a-button v-isPermitted="'room:floor:power'" type="primary" icon="poweroff" title="电源" @click="handleAllPower"></a-button>

        </a-button-group>
      </div>
      <div class="block-list" :style="{height: contentHeight + 'px', 'overflow-y': 'auto'}">
        <a-spin :spinning="loading">
          <div class="block-item" :class="{'active': item.lightState}" v-for="item in dataList" :key="item.id">
            <div class="toolbar">
              <a-popconfirm :title="`${item.lightState ? '关' : '开'}楼层灯?`" @confirm="() => handleLamp(item)">
                <!-- <i v-isPermitted="'room:classroom:lamp'" class="icon obicon obicon-lamp" :class="{active: item.lightState}" title="楼层灯"></i> -->
                <i v-isPermitted="'room:floor:lamp'" class="icon obicon obicon-droplight" style="font-weight: 600;" :class="{active: item.lightState}" title="楼层灯"></i>
              </a-popconfirm>
              <a-popconfirm :title="`${item.switchState ? '关闭' : '开启'}楼层开关?`" @confirm="() => handlePower(item)">
                <i v-isPermitted="'room:floor:switch'" class="icon obicon obicon-power" :class="{active: item.switchState}" title="楼层开关"></i>
              </a-popconfirm>
              <a-icon v-isPermitted="'room:floor:edit'" class="icon" type="edit" title="编辑" @click="handleEdit(item)" />
              <a-popconfirm title="确定删除吗?" @confirm="() => handleRemove(item.id)">
                <a-icon v-isPermitted="'room:floor:delete'" class="icon" type="delete" />
              </a-popconfirm>
            </div>
            <div class="content">
              <i class="building-sign obicon obicon-building"></i>
              <p class="text">
                {{ item.buildingName }}栋{{ item.floorName }}层
              </p>
            </div>
          </div>
        </a-spin>
        <a-pagination style="position: fixed; right: 70px; bottom: 30px;" simple :current="queryParam.pageNo" :pageSize.sync="queryParam.pageSize" :total="total" @change="handlePageChange" />
      </div>
      <floor-modal ref="modalForm" @ok="modalFormOk"></floor-modal>
    </a-card>
  </div>
</template>

<script>
import { getFloorList, delFloor, handleLampPower, handleSwitchPower, getPowerStatus, triggerAllPower } from '@/api/room'
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
        pageNo: 1,
        pageSize: 10
      },
      total: 0
    }
  },
  mounted () {
    this.calculateContentHeight()
    // Helper.windowOnResize(this, this.fixLayout)
    this.$bus.$on('state', () => this.loadData())
  },
  methods: {
    searchReset () {
      this.queryParam = { pageNo: 1, pageSize: 10 }
      this.loadData(1)
    },
    loadData (arg) {
      this.getDataList(arg)
    },
    fixLayout () {
      // this.containerHeight = Helper.calculateTableHeight() - 20
    },
    getDataList (arg) {
      if (arg === 1) {
        this.queryParam.pageNo = 1
      }
      this.loading = true
      getFloorList(this.queryParam).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataList = res.result.records
          this.total = res.result.total
        }
      }).finally(() => this.loading = false)
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
      this.loadData(1)
    },
    handleLamp (item) {
      const params = {
        floorId: item.id,
        deviceType: item.lightState ? 2 : 1
      }
      handleLampPower(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('操作成功')
        } else this.$message.error(res.message)
      })
    },
    handlePower (item) {
      // const isPowerOn = this.isLightActive(item.deviceState)
      // const params = {
      //   floorId: item.id,
      //   deviceType: item.allType === 1 ? 2 : 1
      // }
      // handleLampPower(params).then(res => {
      //   if (this.$isAjaxSuccess(res.code)) {
      //     this.$message.success('操作成功')
      //     // this.loadData()
      //   } else this.$message.error(res.message)
      // })
      const params = {
        floorId: item.id,
        deviceType: item.switchState ? 2 : 1
      }
      handleSwitchPower(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('操作成功')
        } else this.$message.error(res.message)
      })
    },
    async handleAllPower () {
      const that = this
      const res = await getPowerStatus()
      if (!this.$isAjaxSuccess(res.code)) return this.$message.warning('获取开关状态失败')
      this.$confirm({
        title: '确认操作',
        content: '是否' + (res.result ? '关闭' : '开启') + '电源?',
        onOk: function () {
          triggerAllPower(+!res.result ? 1 : 2).then(response => {
            if (that.$isAjaxSuccess(response.code)) {
              that.$message.success('操作成功')
              // that.loadData()
            } else that.$message.error(response.message)
          })
        }
      })
    },
    handleRemove (id) {
      delFloor(id).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('删除成功')
          this.loadData(1)
        } else this.$message.error(res.message)
      })
    },
    handlePageChange (pageNo, pageSize) {
      this.queryParam.pageNo = pageNo
      this.queryParam.pageSize = pageSize
      this.loadData()
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
  // width: 218px;
  // height: 156px;
  width: 230px;
  height: 164px;
  border-radius: 4px;
  overflow: hidden;
  // box-shadow: 0px 0px 3px 1px #c0c4cc;
  box-shadow: 0px 0px 4px 0px #c0c4cc;

  &.active{
    background: #fff4d3;
    // box-shadow: 0px 0px 3px 1px #ebdbac;
    box-shadow: 0px 0px 4px 1px #ebdbac;

    .building-sign{
      color: #353535;
      text-shadow: 0 0 3px #626262;
    }
  }

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
        font-weight: 700;
      }
      & + .icon{
        right: 5px;
      }

      &.active{
        color: #0cadf8;
        font-weight: bolder;
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

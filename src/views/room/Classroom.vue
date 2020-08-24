<template>
  <div class="building ui-container" :style="{height: `${height}px`}">
    <div class="search-bar">
      <div class="caption is-right">
        <a-button-group>
          <a-button type="primary" icon="btn-icon el-icon-refresh" title="刷新" @click="handleRefresh"></a-button>
          <a-button type="primary" icon="btn-icon el-icon-circle-plus-outline" title="添加" @click="handleCreate"></a-button>
          <a-button type="primary" icon="btn-icon obicon obicon-switch-btn" title="开关" @click="handleMainSwitch"></a-button>
        </a-button-group>
      </div>
      <div class="caption">
        <el-input clearable class="caption-item" @keyup.enter.native="handleSearch" v-model="searchModel.buildName" placeholder="楼栋"></el-input>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
      </div>
    </div>
    <div class="building-list" v-loading.lock="loading" :style="{height: (height - 80) + 'px'}">
      <div class="building-item" v-for="item in buildingList" :key="item.id">
        <div class="header">
          <i class="icon obicon obicon-power" title="电源" @click="handlePower(item)"></i>
          <i class="icon el-icon-edit" title="编辑" @click="handleEdit(item)"></i>
          <i class="icon el-icon-delete" title="删除" @click="handleRemove(item)"></i>
        </div>
        <div class="content">
          <i class="building-sign obicon obicon-building-o" :class="{'is-active': item.allType}"></i>
          <p class="text">{{ item.buildName }} 栋</p>
        </div>
      </div>
      <!-- <el-pagination class="pagination" :prev-text="$t('message.prev')" :next-text="$t('message.next')"
        :page-size="searchModel.pageSize" :current-page="searchModel.pageNo" :total="buildingTotal" layout="prev, next"
        @current-change="onCurrentChange" @size-change="onSizeChange">
      </el-pagination> -->
    </div>
    <!-- <el-dialog v-if="createDialogVisible" top="10%" width="660px" :title="dialogTitleMap[dialogStatus]"
      :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <el-form class="ob-form" ref="creation" autoComplete="on" :rules="creationRules" :model="createModel"
        label-position="left" label-width="80px">
        <el-form-item :label="$t('smart.room.label', { LABEL: 'build' })" prop="buildName">
          <el-input v-model="createModel.buildName" :placeholder="$t('message.placeholder', { PLACEHOLDER: 'build' })">
            <template slot="append">{{$t('message.building')}}</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="checkCreate(dialogStatus)">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
// import RoomAPI from '@/api/room'
// import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
// import Helper from '@/common/helper'
export default {
  props: {
    preload: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      loading: false,
      containerHeight: 500,
      buildingList: [],
      createDialogVisible: false,
      dialogStatus: '',
      dialogTitleMap: {
        edit: '编辑',
        create: '添加'
      },
      searchModel: {
        buildName: '',
        // pageNo: PAGINATION_PAGENO,
        // pageSize: PAGINATION_PAGESIZE
      },
      buildingTotal: 0,
      createModel: {
        buildName: ''
      },
      creationRules: {
        buildName: [{ required: true, message: '楼栋不能空', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getBuildingList()
  },
  watch: {
    createDialogVisible (val) {
      if (val === false) {
        this.$refs.creation.resetFields()
      }
    }
  },
  mounted () {
    // Helper.windowOnResize(this, this.fixLayout)
  },
  methods: {
    fixLayout () {
      // this.containerHeight = Helper.calculateTableHeight() - 20
    },
    getBuildingList () {
      this.loading = true
      // RoomAPI.getBuildingList(this.searchModel).then(res => {
      //   if (res.status === 0) {
      //     const {data} = res
      //     this.buildingList = data.records
      //     this.buildingTotal = res.total
      //     if (!this.buildingList.length && this.searchModel.pageNo !== 1) {
      //       this.searchModel.pageNo = PAGINATION_PAGENO
      //       this.getBuildingList()
      //     }
      //   }
      //   this.loading = false
      // })
    },
    handleRefresh () {
      this.createModel.buildName = ''
      this.getBuildingList()
    },
    onCurrentChange (pageNo) {
      this.searchModel.pageNo = pageNo
      this.getBuildingList()
    },
    onSizeChange (pageSize) {
      this.searchModel.pageSize = pageSize
      this.getBuildingList()
    },
    resetModel () {
      this.createModel.buildName = ''
    },
    handleCreate () {
      this.dialogStatus = 'create'
      this.createDialogVisible = true
      this.resetModel()
    },
    checkCreate (type) {
      this.$refs.creation.validate(valid => {
        if (valid) {
          type === 'create' ? this.doCreateAction() : this.doEditAction()
          this.createDialogVisible = false
        }
      })
    },
    doCreateAction () {
      // RoomAPI.addBuilding(this.createModel).then(response => {
      //   if (response.status === 0) {
      //     this.getBuildingList()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: this.$t('message.create') + this.$t('message.fail')
      //     })
      //   }
      // }).catch(() => {
      //   this.$message({
      //     type: 'error',
      //     message: this.$t('message.exception')
      //   })
      // })
    },
    doEditAction () {
      // RoomAPI.updateBuilding(this.createModel).then(response => {
      //   if (response.status === 0) {
      //     this.getBuildingList()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: this.$t('message.edit') + this.$t('message.fail')
      //     })
      //   }
      // }).catch(() => {
      //   this.$message({
      //     type: 'error',
      //     message: this.$t('message.exception')
      //   })
      // })
    },
    handleSearch () {
      this.getBuildingList()
    },
    async handleMainSwitch () {
      // const that = this
      // const res = await RoomAPI.getSwitchGlobalType()
      // if (res.status !== 0) return
      // const action = res.data ? this.$t('message.status', {STATUS: 'close'}) : this.$t('message.status', {STATUS: 'open'})
      // this.$confirm(`${action}${this.$t('smart.building.message', {MESSAGE: 'switchGlobConfirm'})}`, this.$t('message.tips'), {
      //   confirmButtonText: this.$t('message.confirm'),
      //   cancelButtonText: this.$t('message.cancel'),
      //   type: 'warning',
      //   closeOnClickModal: false,
      //   callback (actionText) {
      //     actionText === 'confirm' && that.doHandleSwitch(+!res.data)
      //   }
      // })
    },
    doHandleSwitch (status) {
      console.log(status)
      // const action = status ? this.$t('message.status', {STATUS: 'open'}) : this.$t('message.status', {STATUS: 'close'})
      // const loading = this.$loading({
      //   lock: true,
      //   text: `${action}${this.$t('smart.building.message', {MESSAGE: 'loading'})}`
      // })
      // RoomAPI.triggerGlobalSwitch(status ? 1 : 2).then(res => {
      //   if (res.status === 0) {
      //     this.getBuildingList()
      //     loading.close()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: this.$t('smart.building.message', {STATUS: 'switchFail'})
      //     })
      //   }
      // })
    },
    handlePower (item) {
      const action = item.allType ? '关' : '开'
      this.$confirm(`${action}所有教室开关`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        // RoomAPI.triggerSwitch({buildingId: item.id, deviceType: item.allType ? 2 : 1}).then(res => {
        //   if (res.status === 0) {
        //     this.getBuildingList()
        //   } else {
        //     this.$message({
        //       type: 'error',
        //       message: this.$t('smart.building.message', {STATUS: 'switchFail'})
        //     })
        //   }
        // })
      }).catch(() => {
        console.log('cancel')
      })
    },
    handleEdit (item) {
      this.dialogStatus = 'edit'
      this.createDialogVisible = true
      this.createModel = item
    },
    handleRemove (item) {
      this.$confirm('确认删除教室？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.doRemove(item)
      }).catch(() => {
        console.log('cancel')
      })
    },
    doRemove (row) {
      console.log(row)
      // RoomAPI.removeBuilding(row.id).then(response => {
      //   if (response.status === 0) {
      //     this.getBuildingList()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: this.$t('message.delete') + this.$t('message.fail')
      //     })
      //   }
      // }).catch(() => {
      //   this.$message({
      //     type: 'error',
      //     message: this.$t('message.exception')
      //   })
      // })
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
    margin-right: 20px;
  }
}
.building-list{
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
.building-item{
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

  .header{
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
.building-list{
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

<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="楼栋">
              <a-select placeholder="请选择楼栋" v-model="queryParam.buildingId" allowClear>
                <a-select-option v-for="item in buildingList" :key="item.buildingId" :value="item.buildingId">
                  {{ item.buildingName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="楼层">
              <a-select placeholder="请选择楼层" v-model="queryParam.floorId" allowClear>
                <a-select-option v-for="item in floorList" :key="item.floorId" :value="item.floorId">
                  {{ item.floorName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="教室">
              <a-select placeholder="请选择教室" v-model="queryParam.roomId" allowClear>
                <a-select-option v-for="item in roomList" :key="item.roomId" :value="item.roomId">
                  {{ item.roomName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="场景">
                <a-input placeholder="请输入场景名称" v-model="queryParam.scene_name"></a-input>
              </a-form-item>
            </a-col>
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div v-isPermitted="'scene:add'" class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加场景</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>
    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="sceneNumber"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >
        <span slot="status" slot-scope="status, record">
          <a-switch checked-children="启用" un-checked-children="禁用" :checked="!!record.sceneStatus" @change="handleSceneStatus(record)" />
        </span>
        <span slot="action" slot-scope="text, record">
          <a v-isPermitted="'scene:edit'" @click="handleEdit(record)">编辑</a>

          <a-divider v-isPermitted="'scene:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-isPermitted="'scene:control'">
                <a @click="handleExecute(record.sceneNumber)">执行</a>
              </a-menu-item>
              <a-menu-item v-isPermitted="'scene:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.sceneNumber)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <scene-modal ref="modalForm" @ok="modalFormOk"></scene-modal>
  </a-card>
</template>

<script>
  import SceneModal from './modules/SceneModal'
  import { getSmartSceneList, editSceneStatus, delScene, batchDelScene, execSmartScene } from '@/api/scene'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import SceneMixin from './SceneMixin'

  export default {
    name: '',
    mixins: [ ProListMixin, SceneMixin ],
    components: {
      SceneModal,
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {
          buildingId: undefined,
          floorId: undefined,
          roomId: undefined,
          pageNo: 1,
          pageSize: 10
        },
        columns: [
          {
            title: '场景名称',
            align: 'center',
            dataIndex: 'sceneName',
          },
          {
            title: '楼栋',
            align: 'center',
            dataIndex: 'buildingName',
          },
          {
            title: '楼层',
            align: 'center',
            dataIndex: 'floorName'
          },
          {
            title: '教室',
            align: 'center',
            dataIndex: 'roomName'
          },
          {
            title: '场景状态',
            align: 'center',
            dataIndex: 'sceneStatus',
            scopedSlots: { customRender: 'status' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 170
          }
        ]
      }
    },
    watch: {
      'queryParam.buildingId' (val) {
        this.queryParam.floorId = undefined
        this.floorList = []
        this.getFloorList(val)
      },
      'queryParam.floorId' (val) {
        this.queryParam.roomId = undefined
        this.roomList = []
        this.getRoomList(val)
      },
    },
    created () {
      this.getSceneDeviceList()
    },
    methods: {
      searchReset () {
        this.queryParam = {
          buildingId: undefined,
          floorId: undefined,
          roomId: undefined,
          pageNo: 1,
          pageSize: 10
        }
        this.loadData(1)
      },
      loadData (arg) {
        this.getDataList(arg)
      },
      getDataList (arg) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = {...this.queryParam}
        params.pageNo = this.ipagination.current
        params.pageSize = this.ipagination.pageSize

        this.loading = true
        getSmartSceneList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total || 0
          } else {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      handleSceneStatus (record) {
        record.sceneStatus = 1 - record.sceneStatus
        editSceneStatus(`0${record.sceneStatus}`, record.sceneNumber).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.$message.success('修改成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(() => this.$message.error('服务异常'))
      },
      handleExecute (sceneNumber) {
        execSmartScene(sceneNumber).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.loadData()
            this.$message.success('场景执行成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(() => this.$message.error('服务异常'))
      },
      handleDelete (sceneNumber) {
        delScene(sceneNumber).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.loadData()
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        }).catch(() => this.$message.error('服务异常'))
      },
      batchDel () {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！')
          return
        } else {
          let ids = ''
          for (let a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ','
          }
          let that = this;
          this.$confirm({
            title: '确认删除',
            content: '是否删除选中数据?',
            onOk: function () {
              batchDelScene(ids).then((res) => {
                if (that.$isAjaxSuccess(res.code)) {
                  that.$message.success(res.message)
                  that.loadData(1)
                  that.onClearSelected()
                } else {
                  that.$message.warning(res.message)
                }
              })
            }
          })
        }
      }
    }
  }
</script>

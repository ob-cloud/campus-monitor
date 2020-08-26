<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入设备序列号" v-model="queryParam.serialId"></a-input>

            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="网关">
              <a-select placeholder="请选择楼栋" v-model="queryParam.obox_serial_id">
                <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
                  {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="设备名称">
                <a-input placeholder="请输入设备名称" v-model="queryParam.name"></a-input>
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
    <div class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加设备</a-button>
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >

        <template slot="avatarslot" slot-scope="text, record">
          <div class="anty-img-wrap">
            <a-avatar shape="square" :src="getAvatarView(record.avatar)" icon="user" />
          </div>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="TypeHints.isXkeySocketSwitch(record.device_child_type)">
                <a @click="handleAction(0, record)">开关</a>
              </a-menu-item>

              <a-menu-item v-if="TypeHints.isHumidifierSensors(record.device_child_type)">
                <a @click="handleAction(1, record)">温湿度</a>
              </a-menu-item>

              <a-menu-item v-if="TypeHints.isSettableSceneSocketSwitch(record.device_child_type)">
                <a @click="handleAction(2, record)">设置</a>
              </a-menu-item>

              <a-menu-item v-if="TypeHints.isSimpleLed(record.device_child_type)">
                <a @click="handleAction(3, record)">灯控</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <normal-modal ref="modalForm" @ok="modalFormOk"></normal-modal>
    <lamp-action-modal ref="lampModal" @ok="actionModalOk"></lamp-action-modal>
  </a-card>
</template>

<script>
  import NormalModal from './modules/NormalModal'
  import LampActionModal from './modules/LampActionModal'
  // import PasswordModal from './modules/PasswordModal'
  import { frozenBatch } from '@/api/system'
  import { getOboxDeviceList, getAllOboxList } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import { Descriptor, TypeHints } from 'hardware-suit'

  export default {
    name: 'UserList',
    mixins: [ ProListMixin ],
    components: {
      NormalModal,
      LampActionModal
      // PasswordModal
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {},
        columns: [
          {
            title: '序列号',
            align: 'center',
            dataIndex: 'serialId',
          },
          {
            title: '设备名称',
            align: 'center',
            dataIndex: 'name',
          },
          {
            title: '设备状态',
            align: 'center',
            dataIndex: 'state',
            customRender (status, row) {
              return Descriptor.getStatusDescriptor(status, row.device_type, row.device_child_type)
            }
          },
          {
            title: '设备类型',
            align: 'center',
            dataIndex: 'device_type',
            customRender (t) {
              return Descriptor.getEquipTypeDescriptor(t)
            }
          },
          {
            title: '设备子类型',
            align: 'center',
            dataIndex: 'device_child_type',
            customRender (t, row) {
              return Descriptor.getEquipTypeDescriptor(row.device_type, t)
            }
          },
          {
            title: '异常状态',
            align: 'center',
            customRender (row) {
              if (TypeHints.isSimpleLed(row.device_child_type)) {
                const exception = row.state.slice(14) || '00'
                const bits = exception.split('')
                if (!bits || !bits.length) return '无异常'
                return bits[0] === '1' ? '开路' : bits[1] === '1' ? '短路' : '无异常'
              }
              return '-'
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 170
          }
        ],
        oboxList: [],
        TypeHints,
        url: {
          list: '/sys/user/list',
          delete: '/sys/user/delete',
          deleteBatch: '/sys/user/deleteBatch',
        },
      }
    },
    computed: {
      importExcelUrl (){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    mounted () {
      this.getOboxList()
    },
    methods: {
      loadData () {
        this.getDeviceList()
      },
      getDeviceList () {
        this.loading = true
        const params = {...this.queryParam}
        params.start_index = this.ipagination.current
        params.count = this.ipagination.pageSize
        getOboxDeviceList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      getOboxList () {
        getAllOboxList().then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.oboxList = res.result
          }
        })
      },
      handleAction (type, record) {
        type === 3 && this.$refs.lampModal.show(record)
      },
      actionModalOk () {
        this.loadData()
      },

      getAvatarView (avatar) {
        // return this.url.imgServer + '/' + avatar
        return avatar
      },

      batchFrozen (status) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！')
          return false
        } else {
          let ids = ''
          let that = this
          let isAdmin = false
          that.selectionRows.forEach(function (row) {
            if (row.username == 'admin') {
              isAdmin = true
            }
          });
          if (isAdmin) {
            that.$message.warning('管理员账号不允许此操作,请重新选择！')
            return
          }
          that.selectedRowKeys.forEach(function (val) {
            ids += val + ','
          })
          that.$confirm({
            title: '确认操作',
            content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中账号?',
            onOk: function () {
              frozenBatch({ids: ids, status: status}).then((res) => {
                if (that.$isAjaxSuccess(res.code)) {
                  that.$message.success(res.message)
                  that.loadData()
                  that.onClearSelected()
                } else {
                  that.$message.warning(res.message)
                }
              })
            }
          })
        }
      },
      handleMenuClick (e) {
        if (e.key == 1) {
          this.batchDel()
        } else if (e.key == 2) {
          this.batchFrozen(2)
        } else if (e.key == 3) {
          this.batchFrozen(1)
        }
      },
      handleFrozen (id, status, username) {
        //TODO 后台校验管理员角色
        if ('admin' == username) {
          this.$message.warning('管理员账号不允许此操作！')
          return
        }
        frozenBatch({ids: id, status: status}).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.$message.success(res.message)
            this.loadData()
          } else {
            this.$message.warning(res.message)
          }
        });
      },
      handleChangePassword (username) {
        this.$refs.passwordmodal.show(username)
      },
      passwordModalOk() {
        //TODO 密码修改完成 不需要刷新页面，可以把datasource中的数据更新一下
      }
    }

  }
</script>

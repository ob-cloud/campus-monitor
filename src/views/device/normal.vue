<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入设备序列号" v-model="queryParam.username"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="网关">
              <a-select v-model="queryParam.sex" placeholder="请选择网关设备">
                <a-select-option value="">请选择性别查询</a-select-option>
                <a-select-option value="1">男性</a-select-option>
                <a-select-option value="2">女性</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="设备名称">
                <a-input placeholder="请输入设备名称" v-model="queryParam.email"></a-input>
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
              <a-menu-item v-if="record.status==1">
                <a href="javascript:;">开关</a>
              </a-menu-item>

              <a-menu-item v-if="record.status==2">
                <a href="javascript:;">温湿度</a>
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

    <!-- <user-modal ref="modalForm" @ok="modalFormOk"></user-modal> -->
    <!-- <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal> -->
  </a-card>
</template>

<script>
  // import UserModal from './modules/UserModal'
  // import PasswordModal from './modules/PasswordModal'
  import { frozenBatch } from '@/api/system'
  import { getDeviceList } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'

  export default {
    name: 'UserList',
    mixins: [ ProListMixin ],
    components: {
      // UserModal,
      // PasswordModal
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {},
        columns: [
          {
            title: '设备序列号',
            align: 'center',
            dataIndex: 'username',
            width: 120
          },
          {
            title: '设备名称',
            align: 'center',
            width: 100,
            dataIndex: 'realname',
          },
          {
            title: '设备状态',
            align: 'center',
            width: 120,
            dataIndex: 'avatar',
            scopedSlots: { customRender: 'avatarslot' }
          },

          {
            title: '设备类型',
            align: 'center',
            width: 80,
            dataIndex: 'sex',
            sorter: true,
            customRender (t) {
              const sexMap = {1: '男', 2: '女'}
              return sexMap[t] || ''
            }
          },
          {
            title: '子设备类型',
            align: 'center',
            width: 180,
            dataIndex: 'birthday'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 170
          }
        ],
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
    methods: {
      loadData (arg) {

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1
        }
        let params = this.getQueryParams() //查询条件
        this.loading = true
        getDeviceList(params).then((res) => {
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

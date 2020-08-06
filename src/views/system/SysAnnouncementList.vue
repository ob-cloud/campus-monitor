<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="标题">
              <a-input placeholder="请输入标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('系统通告')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete" />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >

        <span slot="action" slot-scope="text, record">
          <a v-if="record.sendStatus == 0" @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" v-if="record.sendStatus == 0" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多<a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.sendStatus != 1">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.sendStatus == 0">
                <a-popconfirm title="确定发布吗?" @confirm="() => releaseData(record.id)">
                  <a>发布</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.sendStatus == 1">
                <a-popconfirm title="确定撤销吗?" @confirm="() => reovkeData(record.id)">
                  <a>撤销</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleDetail(record)">查看</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <sysAnnouncement-modal ref="modalForm" @ok="modalFormOk"></sysAnnouncement-modal>
  </a-card>
</template>

<script>
  import SysAnnouncementModal from './modules/SysAnnouncementModal'
  import { doReleaseData, doReovkeData } from '@/api/system'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import * as dayjs from 'dayjs'

  export default {
    name: 'SysAnnouncementList',
    mixins: [ ProListMixin ],
    components: {
      SysAnnouncementModal
    },
    data() {
      return {
        description: '系统通告表管理页面',
        // 查询条件
        queryParam: {},
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender (t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '消息类型',
            align: 'center',
            dataIndex: 'msgCategory',
            customRender (text) {
              return ['', '通知公告', '系统消息'][text] || text
            }
          },
          {
            title: '发布人',
            align: 'center',
            dataIndex: 'sender'
          },
          {
            title: '优先级',
            align: 'center',
            dataIndex: 'priority',
            customRender (text) {
              return {
                L: '低',
                M: '中',
                H: '高'
              } [text] || text
            }
          },
          {
            title: '通告对象',
            align: 'center',
            dataIndex: 'msgType',
            customRender (text) {
              if (text === 'USER') {
                return '指定用户'
              } else if (text === 'ALL') {
                return '全体用户'
              } else {
                return text
              }
            }
          },
          {
            title: '发布状态',
            align: 'center',
            dataIndex: 'sendStatus',
            customRender (text) {
              return ['未发布', '已发布', '已撤销'][text] || text
            }
          },
          {
            title: '发布时间',
            align: 'center',
            dataIndex: 'sendTime',
            customRender(t) {
              return t && dayjs(new Date(t)).format('YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            title: '撤销时间',
            align: 'center',
            dataIndex: 'cancelTime',
            customRender(t) {
              return t && dayjs(new Date(t)).format('YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: '/sys/annountCement/list',
          delete: '/sys/annountCement/delete',
          deleteBatch: '/sys/annountCement/deleteBatch',
          releaseDataUrl: '/sys/annountCement/doReleaseData',
          reovkeDataUrl: '/sys/annountCement/doReovkeData',
          exportXlsUrl: 'sys/announcement/exportXls',
          importExcelUrl: 'sys/announcement/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {
      //执行发布操作
      releaseData (id) {
        doReleaseData({ id }).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.$message.success(res.message)
            this.loadData(1)
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      //执行撤销操作
      reovkeData (id) {
        doReovkeData({id}).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.$message.success(res.message)
            this.loadData(1)
          } else {
            this.$message.warning(res.message)
          }
        })
      },
    }
  }
</script>

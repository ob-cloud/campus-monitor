import { getAction, postAction, putAction, deleteAction } from '@/utils/ajax'

////// Menu
// 获取菜单、按钮权限列表
const getMenuList = (params) => getAction('/sys/permission/list', params)
const addMenu = (params) => postAction('/sys/permission/add', params)
const editMenu = (params) => putAction('/sys/permission/edit', params)
const delMenu = (params) => deleteAction('/sys/permission/delete', params)
// 批量删除菜单
const delMenuBatch = (params) => deleteAction('/sys/permission/deleteBatch', params)

// 获取系统菜单树列表
const queryTreeList = (params) => getAction('/sys/permission/queryTreeList', params)
// const queryTreeListForRole = (params) => getAction('/sys/role/queryTreeList', params)
// const queryListAsync = (params) => getAction('/sys/permission/queryListAsync', params)

////// User
const addUser = (params) => postAction('/sys/user/add', params)
const editUser = (params) => putAction('/sys/user/edit', params)
// 查询用户权限
const queryUserRole = (params) => getAction('/sys/user/queryUserRole', params)
const getUserList = (params) => getAction('/sys/user/list', params)
// 批量冻结用户
const frozenBatch = (params) => putAction('/sys/user/frozenBatch', params)
// 修改系统用户密码
const changePassword = (params) => putAction('/sys/user/changPassword', params)
// 修改个人账号密码
const updatePassword = (params) => putAction('/sys/user/updatePassword', params)
// 获取用户菜单、按钮权限
const getUserPermissionList = (params) => getAction('/sys/permission/getUserPermission', params)

///// Role
const addRole = (params) => postAction('/sys/role/add', params)
const editRole = (params) => putAction('/sys/role/edit', params)
// const getRoleList = (params) => getAction('/sys/role/list', params)
// const deleteRole = (params) => deleteAction('/sys/role/delete', params)
// const deleteRoleList = (params) => deleteAction('/sys/role/deleteBatch', params)
const checkRoleCode = (params) => getAction('/sys/role/checkRoleCode', params)
// 查询所有角色
const queryAllRole = (params) => getAction('/sys/role/all', params)
// 获取角色树列表
const queryRoleTreeList = (params) => getAction('/sys/role/queryRoleTreeList', params)

///// Dict
// 根据字典项code，获取字典项值
const ajaxGetDictItems = (code, params) => getAction(`/sys/dict/getDictItems/${code}`, params)
// 添加字典
const addDict = (params) => postAction('/sys/dict/add', params)
const editDict = (params) => putAction('/sys/dict/edit', params)
// 添加字典项
const addDictItem = (params) => postAction('/sys/dict/item/add', params)
const editDictItem = (params) => putAction('/sys/dict/item/edit', params)
// 重复性检测
const duplicateCheck = (params) => getAction('/sys/duplicate/check', params)
// const duplicateCheck = (params) => getAction('/sys/user/checkOnlyUser', params)

///// Permission
// 获取角色权限
const queryRolePermission = (params) => getAction('/sys/permission/queryRolePermission', params)
// 角色授权
const saveRolePermission = (params) => postAction('/sys/permission/saveRolePermission', params)
// 获取角色权限树列表
const queryPermissionTreeList = (params) => getAction('/sys/role/queryTreeList', params)
// const queryPermissionTreeList = (params) => getAction('/sys/role/queryPermissionTreeList', params)


///// Annoucement
// 发布
const doReleaseData = (params) => getAction('/sys/annountCement/doReleaseData', params)
// 撤销
const doReovkeData = (params) => getAction('/sys/annountCement/doReovkeData', params)
// 获取用户通告信息
// const getAnnouncementListByUser = (params) => getAction('/sys/announcement/listByUser', params)
const getAnnouncementListByUser = (params) => getAction('/sys/annountCement/listByUser', params)
// 修改公告状态（已读）
// const editAnnouncementStatus = (params) => putAction('/sys/announcement/editStatus', params)
const editAnnouncementStatus = (params) => putAction('/sys/sysAnnouncementSend/editByAnntIdAndUserId', params)
// 查询消息详情
const queryAnnouncementDetail = (params) => getAction('/sys/annountCement/queryById', params)

///// Message Template
const addMessageTemplate = (params) => postAction('/message/sysMessageTemplate/add', params)
const editMessageTemplate = (params) => putAction('/message/sysMessageTemplate/edit', params)
const queryMessageTemplateList = (params) => getAction('/message/sysMessageTemplate/list', params)
const queryMessageTemplateDetail = (params) => getAction('/message/sysMessageTemplate/queryById', params)
const delessageTemplate = (params) => deleteAction('/message/sysMessageTemplate/delete', params)
const delBatchMessageTemplate = (params) => deleteAction('/message/sysMessageTemplate/deleteBatch', params)

///// System Setting
///// 通过ajaxGetDictItems 使用
const getSystemConfig = () => getAction('/sys/common/setting')

export {
  // Menu
  getMenuList,
  addMenu,
  editMenu,
  delMenu,
  delMenuBatch,
  queryTreeList,

  // Role
  addRole,
  editRole,
  checkRoleCode,
  queryAllRole,
  queryRoleTreeList,

  // Permission
  queryRolePermission,
  saveRolePermission,
  queryPermissionTreeList,

  // User
  addUser,
  editUser,
  queryUserRole,
  getUserList,
  frozenBatch,
  getUserPermissionList,
  changePassword,
  updatePassword,

  // Dict
  ajaxGetDictItems,
  addDict,
  editDict,
  addDictItem,
  editDictItem,
  duplicateCheck,

  // Annoucement
  doReleaseData,
  doReovkeData,
  getAnnouncementListByUser,
  editAnnouncementStatus,
  queryAnnouncementDetail,

  // Message Template
  addMessageTemplate,
  editMessageTemplate,
  queryMessageTemplateList,
  queryMessageTemplateDetail,
  delessageTemplate,
  delBatchMessageTemplate,

  // System
  getSystemConfig
}

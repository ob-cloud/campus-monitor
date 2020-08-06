import Vue from 'vue'
import { login, logout } from '@/api/login'
import { getUserPermissionList } from '@/api/system'
import { ACCESS_TOKEN, USER_NAME, USER_INFO, USER_AUTH } from '@/store/mutation-types'
import { welcome, isAjaxSuccess } from '@/utils/util'

const user = {
  state: {
    token: '',
    username: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    permissionList: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.username = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_PERMISSIONLIST: (state, permissionList) => {
      state.permissionList = permissionList
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (isAjaxSuccess(response.code)) {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            resolve(response)
          } else {
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    GetPermissionList ({ commit }) {
      return new Promise((resolve, reject) => {
        getUserPermissionList().then(response => {
          if (!isAjaxSuccess(response.code)) {
            reject()
          }
          const menu = response.result.menu
          const auth = response.result.auth

          sessionStorage.setItem(USER_AUTH, JSON.stringify(auth))
          if (menu && menu.length > 0) {
            commit('SET_PERMISSIONLIST', menu)
          } else {
            reject(new Error('getPermissionList: permissions must be a non-null array!'))
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit }) {
      return new Promise((resolve) => {
        logout().then(() => {
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          Vue.ls.remove(ACCESS_TOKEN)
        })
        // commit('SET_TOKEN', '')
        // commit('SET_PERMISSIONLIST', [])
        // Vue.ls.remove(ACCESS_TOKEN)
      })
    }

  }
}

export default user

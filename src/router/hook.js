
import Vue from 'vue'
import store from '../store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { generateIndexRouter } from "@/utils/util"
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // progress bar style

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/user/login', '/user/register', '/user/register-result', '/user/alteration'] // no redirect whitelist

export const initRouteHook = (router) => {
  router.beforeEach((to, from, next) => {
    NProgress.start() // start progress bar

    if (Vue.ls.get(ACCESS_TOKEN)) {
      // store.dispatch('GetSystemSetting')
      /* has token */
      if (to.path === '/user/login') {
        next({ path: '/dashboard/analysis' })
        NProgress.done()
      } else {
        if (store.getters.permissionList.length === 0) {
          store.dispatch('GetPermissionList').then(res => {
            const menuData = res.result.menu
            console.log(res.message)
            if (!menuData) {
              return
            }
            let constRoutes = []
            constRoutes = generateIndexRouter(menuData)
            // 添加主界面路由
            store.dispatch('UpdateAppRouter',  { constRoutes }).then(() => {
              // 根据roles权限生成可访问的路由表
              // 动态添加可访问路由表
              router.addRoutes(store.getters.addRouters)
              const redirect = decodeURIComponent(from.query.redirect || to.path)
              if (to.path === redirect) {
                // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true })
              } else {
                // 跳转到目的路由
                next({ path: redirect })
              }
            })
          }).catch(() => {
            store.dispatch('Logout').then(() => {
              next({ path: '/user/login', query: { redirect: to.fullPath } })
            })
          })
        } else {
          next()
        }
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        // 在免登录白名单，直接进入
        next()
      } else {
        next({ path: '/user/login', query: { redirect: to.fullPath } })
        NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
      }
    }
  })

  router.afterEach(() => {
    NProgress.done() // finish progress bar
  })
}

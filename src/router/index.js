import Vue from 'vue'
import VueRouter from 'vue-router'

import { constantRouterMap } from '@/config/router.config'
// import { isProEnv } from "@/config/env.config"
import { initRouteHook } from "./hook"

// hack router push callback --- NavigationDuplicated
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  // base: isProEnv() ? 'pro' : '/',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
// Router Controller
initRouteHook(router)

export default router

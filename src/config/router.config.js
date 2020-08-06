import { UserLayout } from '@/components/Layouts'

/**
 * @type {[null,null]}
 */
export const asyncRouterMap = [
  // {
  //   path: '/',
  //   name: 'dashboard',
  //   component: BasicLayout,
  //   meta: { title: '首页' },
  //   redirect: '/dashboard/workplace',
  //   children: [
  //     {
  //       path: '/dashboard',
  //       name: 'dashboard',
  //       redirect: '/dashboard/workplace',
  //       component: RouteView,
  //       meta: { title: '仪表盘', icon: 'dashboard' },
  //       children: [
  //         {
  //           path: '/dashboard/analysis',
  //           name: 'Analysis',
  //           component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Analysis'),
  //           meta: { title: '分析页' }
  //         },
  //         {
  //           path: '/dashboard/workplace',
  //           name: 'Workplace',
  //           component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Workplace'),
  //           meta: { title: '工作台' }
  //         }
  //       ]
  //     },
  //   ]
  // },
  // {
  //   path: '*', redirect: '/404', hidden: true
  // }
]

export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]

import { isURL } from '@/utils/validator'

export function timeFix () {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome () {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent () {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader (callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () {}
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

export function isIE () {
  const bw = window.navigator.userAgent
  const compare = (s) => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

export function isEmptyObj (obj = {}) {
  if (!(typeof obj === 'object')) {
    console.log('Warning: the argument should be an object!')
  }
  for (let key in obj) {
    return false
  }
  return true
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate (id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

// 生成首页路由
export function generateIndexRouter (data) {
  let indexRouter = [{
    path: '/',
    name: 'dashboard',
    component: () => import('@components/Layouts/BasicLayout.vue'),
    meta: {
      title: '首页'
    },
    redirect: '/dashboard/analysis',
    children: [
      ...generateChildRouters(data)
    ]
  }, {
    path: '*',
    redirect: '/404',
    hidden: true
  }]

  return indexRouter
}

// 生成嵌套路由（子路由）
function generateChildRouters (data) {
  const routers = [];
  for (let item of data) {
    let component = ''
    if (item.component.indexOf('Layouts') >= 0) {
      component = 'components/' + item.component
    } else {
      component = 'views/' + item.component
    }

    // URL支持{{ window.xxx }}占位符变量
    let URL = (item.meta.url || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2))
    if (isURL(URL)) {
      item.meta.url = URL
    }

    let menu = {
      path: item.path,
      name: item.name,
      redirect: item.redirect,
      component: () => import(`@/${component}.vue`),
      hidden: item.hidden,
      meta: {
        title: item.meta.title,
        icon: item.meta.icon,
        url: item.meta.url,
        permissionList: item.meta.permissionList,
        keepAlive: item.meta.keepAlive
      }
    }
    if (item.alwaysShow) {
      menu.alwaysShow = true
      menu.redirect = menu.path
    }
    if (item.children && item.children.length > 0) {
      menu.children = [...generateChildRouters(item.children)]
    }
    // 根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）
    // 判断是否生成路由
    if (item.route && item.route === '0') {
      //console.log(' 不生成路由 item.route：  '+item.route);
      //console.log(' 不生成路由 item.path：  '+item.path);
    } else {
      routers.push(menu)
    }
  }
  return routers
}

/**
 * 过滤对象中为空的属性
 * @param obj
 * @returns {*}
 */
export function filterObj(obj) {
  if (!(typeof obj == 'object')) {
    return
  }

  for (let key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] !== 'boolean' && !obj[key]) {
      delete obj[key]
    }
  }
  return obj
}

export function isAjaxSuccess (code) {
  return code && code.toLowerCase() === 'ok'
}

// export function ajaxResponseFn (code, callback) {

// }

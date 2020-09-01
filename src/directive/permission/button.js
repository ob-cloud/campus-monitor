import { disabledAuthFilter } from '@/utils/authFilter'

export function isPermitted(code, permissions = null) {
  return !disabledAuthFilter(code, permissions)
}

export function $isPermitted(code, permissions) {
  return isPermitted(code, permissions)
}

export default {
  inserted (el, binding) {
    const { value } = binding
    if (value && !isPermitted(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

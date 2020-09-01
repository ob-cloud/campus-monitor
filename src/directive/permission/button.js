import { globalAuth } from '@/utils/authFilter'

export function isPermitted(code) {
  return globalAuth(code)
}

export function $isPermitted(code) {
  return isPermitted(code)
}

export default {
  inserted (el, binding) {
    const { value } = binding
    if (value && !isPermitted(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

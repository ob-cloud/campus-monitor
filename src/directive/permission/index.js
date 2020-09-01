import isPermitted from './button'

isPermitted.install = Vue => {
  Vue.directive('isPermitted', isPermitted)
}
export default isPermitted

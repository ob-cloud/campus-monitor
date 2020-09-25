import { Descriptor } from 'hardware-suit'

export const getActionModel = () => {
  return {
    // serialId: '',
    id: Date.now(),
    action_time: 0,
    deviceType: undefined,
    actionDescriptor: '',
    action: ''
  }
}

export const classifyTypeList = (list) => {
  const obj = {}
  for (let index = 0; index < list.length; index++) {
    const element = list[index]
    if (!obj[element.deviceType]) {
      obj[element.deviceType] = []
    }
    const item = {
      title: Descriptor.getTypeDescriptor(element.deviceType),
      subtitle: Descriptor.getTypeDescriptor(element.deviceType, element.deviceChildType),
      ...getActionModel(),
      ...element
    }
    obj[element.deviceType].push(item)
  }
  return obj
}

export const getClassify = (typeObj) => {
  return Object.keys(typeObj).map(element => {
    // const deviceType = element.split('-')[0]
    // const deviceChildType = element.split('-')[1]
    return {
      deviceType: element,
      deviceChildType: typeObj[element][0].deviceChildType,
      title: Descriptor.getTypeDescriptor(element),
      children: typeObj[element]
    }
  })
}

export const toClassify = () => {
  //
}

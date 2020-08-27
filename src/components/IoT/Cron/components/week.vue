<template lang="html">
  <div :val="value_">
    <a-radio-group v-model="type">
      <div class="block">
        <a-radio :value="1" border>每{{ label }}</a-radio>
      </div>
      <div class="block">
        <a-radio :value="5" border>不指定</a-radio>
      </div>
      <div class="block">
        <a-radio :value="2" border>周期</a-radio>
        <span style="margin-left: 10px; margin-right: 5px;">从星期</span>
        <!-- <a-input-number controls-position="right" @change="type = '2'" v-model="cycle.start" :min="1" :max="7" style="width: 100px;"></a-input-number> -->
        <a-select v-model="cycle.start" style="width: 100px;" clearable @change="type = 2">
          <a-select-option
            v-for="(i, v) in weeks"
            :key="'key'+i"
            :value="''+ (v+1)"
          >
            {{ i }}
          </a-select-option>
        </a-select>
        <span style="margin-left: 5px; margin-right: 5px;">至星期</span>
        <!-- <a-input-number controls-position="right" @change="type = '2'" v-model="cycle.end" :min="2" :max="7" style="width: 100px;"></a-input-number> -->
        <a-select v-model="cycle.end" style="width: 100px;" clearable @change="type = 2">
          <a-select-option
            v-for="(i, v) in weeks"
            :key="'key'+i"
            :value="''+ (v+1)"
          >
            {{ i }}
          </a-select-option>
        </a-select>
      </div>
      <!-- <div>
        <a-radio v-model="type" value="3" border>循环</a-radio>
        <span style="margin-left: 10px; margin-right: 5px;">从星期</span>
        <a-input-number controls-position="right" @change="type = '3'" v-model="loop.start" :min="1" :max="7" style="width: 100px;"></a-input-number>
        <span style="margin-left: 5px; margin-right: 5px;">开始，每</span>
        <a-input-number controls-position="right" @change="type = '3'" v-model="loop.end" :min="1" :max="7" style="width: 100px;"></a-input-number>
        天执行一次
      </div> -->
      <!-- <div>
        <a-radio v-model="type" value="7" border>指定周</a-radio>
        <span style="margin-left: 10px; margin-right: 5px;">本月第</span>
        <a-input-number controls-position="right" @change="type = '7'" v-model="week.start" :min="1" :max="4" style="width: 100px;"></a-input-number>
        <span style="margin-left: 5px; margin-right: 5px;">周，星期</span>
        <a-input-number controls-position="right" @change="type = '7'" v-model="week.end" :min="1" :max="7" style="width: 100px;"></a-input-number>
      </div> -->
      <!-- <div>
        <a-radio v-model="type" value="6" border>本月最后一个</a-radio>
        <span style="margin-left: 10px; margin-right: 5px;">星期</span>
        <a-input-number controls-position="right" @change="type = '6'" v-model="last" :min="1" :max="7" style="width: 100px;"></a-input-number>
      </div> -->
      <div class="block">
        <a-radio :value="4" border>指定</a-radio>
        <a-checkbox-group v-model="appoint" style="margin-left: 50px;  line-height: 25px;">
          <a-checkbox @change="type = 4" v-for="i in 7" :key="i" :value="'' + i">{{ weeks[i - 1] }}</a-checkbox>
        </a-checkbox-group>
      </div>
    </a-radio-group>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '?'
    },
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      type: 5, // 类型
      cycle: { // 周期
        start: '2',
        end: '2'
      },
      loop: { // 循环
        start: 0,
        end: 0
      },
      week: { // 指定周
        start: 0,
        end: 0
      },
      work: 0,
      last: 0,
      appoint: [], // 指定
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
    }
  },
  computed: {
    value_ () {
      const result = []
      switch (this.type) {
        case 1: // 每秒
          result.push('*')
          break
        case 2: // 年期
          result.push(`${this.cycle.start}-${this.cycle.end}`)
          break
        case 3: // 循环
          result.push(`${this.loop.start}/${this.loop.end}`)
          break
        case 4: // 指定
          // result.push(this.appoint.join(','))
          result.push(this.appoint.length ? this.appoint.join(',') : '1')
          break
        case 6: // 最后
          result.push(`${this.last === 0 ? '' : this.last}L`)
          break
        case 7: // 指定周
          result.push(`${this.week.start}#${this.week.end}`)
          break
        default: // 不指定
          result.push('?')
          break
      }
      this.$emit('input', result.join(''))
      return result.join('')
    }
  },
  watch: {
    'value' () {
      this.updateVal()
    },
    type (val) {
      if (val !== 4) {
        this.appoint = []
      }
    }
  },
  methods: {
    updateVal () {
      if (!this.value) {
        return
      }
      if (this.value === '?') {
        this.type = 5
      } else if (this.value.indexOf('-') !== -1) { // 2周期
        if (this.value.split('-').length === 2) {
          this.type = 2
          this.cycle.start = this.value.split('-')[0]
          this.cycle.end = this.value.split('-')[1]
        }
      } else if (this.value.indexOf('/') !== -1) { // 3循环
        if (this.value.split('/').length === 2) {
          this.type = 3
          this.loop.start = this.value.split('/')[0]
          this.loop.end = this.value.split('/')[1]
        }
      } else if (this.value.indexOf('*') !== -1) { // 1每
        this.type = 1
      } else if (this.value.indexOf('L') !== -1) { // 6最后
        this.type = 6
        this.last = this.value.replace('L', '')
      } else if (this.value.indexOf('#') !== -1) { // 7指定周
        if (this.value.split('#').length === 2) {
          this.type = 7
          this.week.start = this.value.split('#')[0]
          this.week.end = this.value.split('#')[1]
        }
      } else if (this.value.indexOf('W') !== -1) { // 8工作日
        this.type = 8
        this.work = this.value.replace('W', '')
      } else { // *
        this.type = 4
        this.appoint = this.value.split(',')
      }
    }
  },
  created () {
    this.updateVal()
  }
}
</script>

<style lang="css" scoped>
.block{
  padding: 6px;
}
</style>

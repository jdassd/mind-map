<template>
  <el-dialog :title="$t('home.createMindMap')" :visible.sync="dialogVisible" width="400px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item :label="$t('home.mindMapTitle')" prop="title">
        <el-input v-model="form.title" :placeholder="$t('home.titlePlaceholder')" autofocus></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="dialogVisible = false">{{ $t('home.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleCreate">{{ $t('home.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createMindMap } from '@/api/mindmaps'
import { createTeamMindMap } from '@/api/teams'
import { getDefaultMindMapData } from '@/api'

export default {
  name: 'CreateMindMapDialog',
  props: {
    visible: Boolean,
    teamId: { type: String, default: null }
  },
  data() {
    return {
      form: { title: '' },
      rules: {
        title: [{ required: true, message: this.$t('home.titleRequired'), trigger: 'blur' }]
      },
      loading: false
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    }
  },
  methods: {
    async handleCreate() {
      try {
        await this.$refs.form.validate()
      } catch { return }
      this.loading = true
      try {
        const defaultData = getDefaultMindMapData()
        defaultData.root.data.text = this.form.title
        const payload = { title: this.form.title, data: defaultData, config: {} }
        if (this.teamId) {
          await createTeamMindMap(this.teamId, payload)
        } else {
          await createMindMap(payload)
        }
        this.$emit('created')
        this.form.title = ''
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('home.createFailed'))
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.form.title = ''
    }
  }
}
</script>

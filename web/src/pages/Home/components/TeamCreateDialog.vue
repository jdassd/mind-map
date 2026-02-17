<template>
  <el-dialog :title="$t('home.createTeam')" :visible.sync="dialogVisible" width="400px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item :label="$t('home.teamName')" prop="name">
        <el-input v-model="form.name" :placeholder="$t('home.teamNamePlaceholder')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('home.teamDesc')">
        <el-input v-model="form.description" type="textarea" :rows="3"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="dialogVisible = false">{{ $t('home.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleCreate">{{ $t('home.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createTeam } from '@/api/teams'

export default {
  name: 'TeamCreateDialog',
  props: { visible: Boolean },
  data() {
    return {
      form: { name: '', description: '' },
      rules: {
        name: [{ required: true, message: this.$t('home.teamNameRequired'), trigger: 'blur' }]
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
      try { await this.$refs.form.validate() } catch { return }
      this.loading = true
      try {
        await createTeam(this.form)
        this.$emit('created')
        this.form = { name: '', description: '' }
      } catch {
        this.$message.error(this.$t('home.createFailed'))
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.form = { name: '', description: '' }
    }
  }
}
</script>

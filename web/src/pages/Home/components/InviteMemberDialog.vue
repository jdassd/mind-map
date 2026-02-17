<template>
  <el-dialog :title="$t('home.inviteMember')" :visible.sync="dialogVisible" width="400px" append-to-body>
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item :label="$t('auth.email')" prop="email">
        <el-input v-model="form.email" :placeholder="$t('home.inviteEmailPlaceholder')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('home.role')">
        <el-radio-group v-model="form.role">
          <el-radio label="editor">Editor</el-radio>
          <el-radio label="viewer">Viewer</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="dialogVisible = false">{{ $t('home.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleInvite">{{ $t('home.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { inviteMember } from '@/api/teams'

export default {
  name: 'InviteMemberDialog',
  props: {
    visible: Boolean,
    teamId: { type: String, required: true }
  },
  data() {
    return {
      form: { email: '', role: 'viewer' },
      rules: {
        email: [{ required: true, type: 'email', message: this.$t('auth.emailRequired'), trigger: 'blur' }]
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
    async handleInvite() {
      try { await this.$refs.form.validate() } catch { return }
      this.loading = true
      try {
        await inviteMember(this.teamId, this.form)
        this.$message.success(this.$t('home.inviteSuccess'))
        this.$emit('invited')
        this.dialogVisible = false
      } catch (err) {
        const msg = err._friendlyMessage || (err.response && err.response.data && err.response.data.detail)
        this.$message.error(msg || this.$t('home.inviteFailed'))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div class="mindmap-list" v-loading="loading">
    <div v-if="!loading && items.length === 0" class="empty-state">
      <i class="el-icon-folder-opened" style="font-size: 48px; color: #ccc"></i>
      <p>{{ $t('home.noMindMaps') }}</p>
    </div>
    <div class="card-grid" v-else>
      <MindMapCard v-for="item in items" :key="item.id" :item="item" @open="$emit('open', item)" @delete="$emit('delete', item)" />
    </div>
  </div>
</template>

<script>
import MindMapCard from './MindMapCard.vue'

export default {
  name: 'MindMapList',
  components: { MindMapCard },
  props: {
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
  }
}
</script>

<style lang="less" scoped>
.mindmap-list {
  min-height: 200px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
  p { margin-top: 12px; }
}
</style>

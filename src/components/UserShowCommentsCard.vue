<template>
  <div class="card">
    <div class="card-header">
      <strong>{{comments.length}}</strong> 已評論餐廳
    </div>
    <div class="card-body">
      <router-link
        v-for="comment in comments"
        :key="comment.id"
        :to="{name: 'restaurant-show', params: { id: comment.Restaurant.id }}"
      >
        <img :src="comment.Restaurant.image | emptyImage" width="60" height="60" class="mr-1">
      </router-link>
    </div>
  </div>
</template>

<script>
import { emptyImageFilter } from '@/utils/mixin'

export default {
  name: 'UserShowCommentsCard',
  mixins: [emptyImageFilter],
  props: {
    comments: {
      type: Array,
      default: () => []
    }
  }
}
</script>

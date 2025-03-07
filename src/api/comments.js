import { apiHelper } from '@/utils/helpers'

export default {
  new({ restaurantId, text }) {
    return apiHelper.post(`/comments`, {
      restaurantId,
      text
    })
  },
  remove({ commentId }) {
    return apiHelper.delete(`/comments/${commentId}`)
  }
}

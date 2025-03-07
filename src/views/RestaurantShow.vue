<template>
  <div>
    <div class="row">
      <div class="col-md-12 mb-3">
        <h1>{{restaurant.name}}</h1>
        <p class="badge badge-secondary mt-1 mb-3">{{restaurant.categoryName}}</p>
      </div>
      <div class="col-lg-4">
        <img
          class="img-responsive center-block"
          :src="restaurant.image | emptyImage"
          style="width: 250px;margin-bottom: 25px;"
        >
        <div class="contact-info-wrap">
          <ul class="list-unstyled">
            <li>
              <strong>Opening Hour:</strong>
              {{restaurant.openingHours}}
            </li>
            <li>
              <strong>Tel:</strong>
              {{restaurant.tel}}
            </li>
            <li>
              <strong>Address:</strong>
              {{restaurant.address}}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-8">
        <p>{{restaurant.description}}</p>
        <router-link
          class="btn btn-primary btn-border mr-2"
          :to="{name: 'restaurant-dashboard', params: {id: restaurant.id }}"
        >Dashboard</router-link>

        <button
          v-if="restaurant.isFavorited"
          @click.stop.prevent="removeFavorite(restaurant.id)"
          type="button"
          class="btn btn-danger btn-border mr-2"
        >移除最愛</button>
        <button
          v-else
          @click.stop.prevent="addFavorite(restaurant.id)"
          type="button"
          class="btn btn-primary btn-border mr-2"
        >加到最愛</button>
        <button
          v-if="restaurant.isLiked"
          @click.stop.prevent="removeLike(restaurant.id)"
          type="button"
          class="btn btn-danger mr-2"
        >Unlike</button>
        <button
          v-else
          @click.stop.prevent="addLike(restaurant.id)"
          type="button"
          class="btn btn-primary mr-2"
        >Like</button>
      </div>
    </div>
    <hr>
    <RestaurantComments
      :restaurant-comments="restaurantComments"
      @after-remove-comment="removeComment"
    />
    <CreateComment :restaurant-id="restaurant.id" @after-create-comment="createComment"/>
    <!-- TODO-1 頁尾部份，目前將原寫法加上註解，因想讓此頁的回上一頁以 pagination 的箭頭方式呈現，但不確定目前這樣的寫法是否實際帶使用者是回上一頁。 -->
    <!-- <a href="#" @click="$router.back()">回上一頁</a> -->
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item">
          <router-link
            class="page-link"
            :to="{name: 'restaurants', query: { categoryId, page: previousPage }}"
          >
            <span aria-hidden="true">&laquo;</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RestaurantComments from '@/components/RestaurantComments'
import CreateComment from '@/components/CreateComment'
import restaurantsAPI from '@/api/restaurants'
import usersAPI from '@/api/users'
import { Toast } from '@/utils/helpers'
import { emptyImageFilter } from '@/utils/mixin'

export default {
  name: 'RestaurantShow',
  components: {
    RestaurantComments,
    CreateComment
  },
  mixins: [emptyImageFilter],
  data() {
    return {
      restaurant: {
        id: -1,
        name: '',
        categoryName: '',
        image: '',
        openingHours: '',
        tel: '',
        address: '',
        description: '',
        isFavorited: false,
        isLiked: false
      },
      restaurantComments: []
    }
  },
  computed: {
    ...mapState(['currentUser'])
  },
  mounted() {
    const { id: restaurantId } = this.$route.params
    this.fetchRestaurant(restaurantId)
  },
  methods: {
    async fetchRestaurant(restaurantId) {
      try {
        const { data, statusText } = await restaurantsAPI.getRestaurant({
          restaurantId
        })

        if (statusText !== 'OK') {
          throw new Error(statusText)
        }

        this.restaurant = {
          ...this.restaurant,
          id: data.restaurant.id,
          name: data.restaurant.name,
          categoryName: data.restaurant.Category.name,
          image: data.restaurant.image,
          openingHours: data.restaurant.opening_hours,
          tel: data.restaurant.tel,
          address: data.restaurant.address,
          description: data.restaurant.description,
          isFavorited: data.isFavorited,
          isLiked: data.isLiked
        }

        this.restaurantComments = data.restaurant.Comments
      } catch (error) {
        Toast.fire({
          type: 'error',
          title: '無法取得餐廳資料，請稍後再試'
        })
      }
    },
    createComment(payload) {
      const { restaurantId, text, commentId } = payload

      this.restaurantComments.push({
        id: commentId,
        RestaurantId: restaurantId,
        User: {
          id: this.currentUser.id,
          name: this.currentUser.name
        },
        text,
        createdAt: new Date()
      })
    },
    removeComment(payload) {
      const { commentId } = payload

      this.restaurantComments = this.restaurantComments.filter(
        comment => comment.id !== commentId
      )
    },
    async addFavorite(restaurantId) {
      try {
        const { data, statusText } = await usersAPI.addFavorite({
          restaurantId
        })

        if (statusText !== 'OK' || data.status !== 'success') {
          throw new Error(statusText)
        }

        this.restaurant = {
          ...this.restaurant,
          isFavorited: true
        }
      } catch (error) {
        Toast.fire({
          type: 'error',
          title: '無法將餐廳加入最愛，請稍後再試'
        })
      }
    },
    async removeFavorite(restaurantId) {
      try {
        const { data, statusText } = await usersAPI.removeFavorite({
          restaurantId
        })

        if (statusText !== 'OK' || data.status !== 'success') {
          throw new Error(statusText)
        }

        this.restaurant = {
          ...this.restaurant,
          isFavorited: false
        }
      } catch (error) {
        Toast.fire({
          type: 'error',
          title: '無法將餐廳從最愛移除，請稍後再試'
        })
      }
    },
    async addLike(restaurantId) {
      try {
        const { data, statusText } = await usersAPI.addLike({ restaurantId })

        if (statusText !== 'OK' || data.status !== 'success') {
          throw new Error(statusText)
        }

        this.restaurant = {
          ...this.restaurant,
          isLiked: true
        }
      } catch (error) {
        Toast.fire({
          type: 'error',
          title: '無法按讚，請稍後再試'
        })
      }
    },
    async removeLike(restaurantId) {
      try {
        const { data, statusText } = await usersAPI.removeLike({
          restaurantId
        })

        if (statusText !== 'OK' || data.status !== 'success') {
          throw new Error(statusText)
        }

        this.restaurant = {
          ...this.restaurant,
          isLiked: false
        }
      } catch (error) {
        Toast.fire({
          type: 'error',
          title: '無法取消按讚，請稍後再試'
        })
      }
    }
  }
}
</script>
<style lang="css" scoped>
h1 {
  margin-bottom: 3px;
}
.badge.badge-secondary {
  font-size: 12.5px;
}
.col-lg-8 p,
.contact-info-wrap li,
.contact-info-wrap strong {
  font-family: 'noto_serif', serif;
  font-size: 17px;
}
.pagination {
  display: flex;
  justify-content: start;
  margin-top: 6px;
}
</style>

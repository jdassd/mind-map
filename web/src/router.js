import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/Login/Index.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./pages/Register/Index.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home/Index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import('./pages/Edit/Index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/index',
    redirect: '/'
  },
  {
    path: '/doc/zh',
    component: () => import('./pages/Doc.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // takeover 模式下跳过所有守卫
  if (window.takeOverApp) {
    next()
    return
  }

  const isLoggedIn = store.getters['auth/isLoggedIn']

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router

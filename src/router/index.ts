//import HomeView from '@/views/Home.vue';
import Index from '@/views/index.vue'
import MainPage from '@/views/mainpage.vue';
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index
    },
    {
    path: '/main',
    name: 'MainPage',
    component: MainPage,
  },
    // {
    //   path: '/test',
    //   name: 'test',
    //   component: () => import('../views/test.vue')
    // }
  ]
})

export default router

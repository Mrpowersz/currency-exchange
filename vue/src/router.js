import { createRouter, createWebHistory } from 'vue-router';
import UsdExchangeTable from './components/UsdExchangeTable.vue';
import GbpExchangeTable from './components/GbpExchangeTable.vue';
import AudExchangeTable from './components/AudExchangeTable.vue';

const routes = [
  { path: '/usd', component: UsdExchangeTable },
  { path: '/gbp', component: GbpExchangeTable },
  { path: '/aud', component: AudExchangeTable },
  { path: '/', redirect: '/usd' } 
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
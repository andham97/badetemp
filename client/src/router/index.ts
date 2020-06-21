import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Overview from '../views/Overview.vue';

Vue.use(VueRouter);

export const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Overview',
        component: Overview,
    },
    {
        path: '/add',
        name: 'AddReading',
        component: () => import('../views/AddReading.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;

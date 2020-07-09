import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Overview from '../views/Overview.vue';

Vue.use(VueRouter);

export const routes: RouteConfig[] = [
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

const routesAll: RouteConfig[] = [
    ...routes,
    {
        path: '/signIn',
        name: 'SignIn',
        component: () => import ('../views/Login.vue'),
    },
    {
        path: '/join',
        name: 'Join',
        component: () => import ('../views/Join.vue'),
    },
    {
        path: '/location/:location',
        name: 'Location Detail',
        component: () => import ('../views/LocationDetails.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routesAll,
});

export default router;

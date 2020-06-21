import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { routes } from '@/router';

@Component
export default class AppNavigation extends Vue {
    public name = 'AppNavigation';
    public appTitle = 'Badetemp';
    public drawer = false;
    public items = routes;
}
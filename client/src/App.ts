import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppNavigation from '@/components/AppNavigation.vue';

@Component({
    components: {
        AppNavigation,
    },
})
export default class App extends Vue {
    public name = 'App';
}
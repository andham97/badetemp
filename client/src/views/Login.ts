import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Login extends Vue {
    public username = '';
    public password = '';

    public async login(): Promise<void> {

    }
}
import Vue from 'vue';
import Component from 'vue-class-component';
import LocationChart from '@/components/LocationChart';

@Component({
    components: {
        LocationChart
    },
})
export default class LocationDetails extends Vue {
    public location: string = '';

    public created() {
        this.location = this.$route.params.location;
    }
}
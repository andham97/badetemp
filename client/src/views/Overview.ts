import Vue from 'vue';
import Component from 'vue-class-component';
import GQLService from '@/services/GQLService';
import { Watch } from 'vue-property-decorator';
import AreaChart from '@/components/AreaChart.vue';
import LocationChart from '@/components/LocationChart.vue';
import AreaLocationList from '@/components/AreaLocationList.vue';
import LocationService from '@/services/LocationService';

@Component({
    components: {
        AreaChart,
        AreaLocationList,
        LocationChart,
    },
})
export default class Overview extends Vue {
    public data: Highcharts.SeriesOptionsType[] = [];
    public selectedArea = 'Skien';
    public areas: string[] = [];

    private GQLService = new GQLService();
    private LocationService = new LocationService();

    @Watch('selectedArea')
    public areaChanged(value: string) {
        this.selectedArea = value;
    }

    async beforeMount(): Promise<void> {
        this.areas = (await this.GQLService.getQuery<{ areas: string[] }>(`{ areas }`)).data.areas.sort();
    }
    async mounted(): Promise<void> {
        try {
            const position = await this.LocationService.getUserLocation();
            console.log(position);
            const area = await this.GQLService.getQuery<{ areaClosestToLocation: string }>(`{ areaClosestToLocation(lat: ${position.lat}, lng: ${position.lng}) }`);
            this.selectedArea = area.data.areaClosestToLocation;
        }
        catch (err) {
            console.log(err.message);
        }
    }
}

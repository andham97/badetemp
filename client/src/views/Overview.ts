import Vue from 'vue';
import Component from 'vue-class-component';
import GQLService from '@/services/GQLService';
import { Watch } from 'vue-property-decorator';
import AreaChart from '@/components/AreaChart.vue';
import LocationChart from '@/components/LocationChart.vue';
import AreaLocationList from '@/components/AreaLocationList.vue';

@Component({
    components: {
        AreaChart,
        AreaLocationList,
        LocationChart,
    },
})
export default class Overview extends Vue {
    public data: Highcharts.SeriesOptionsType[] = [];
    public selectedArea = 'Siljan';
    public areas: string[] = [];

    private GQLService = new GQLService();

    @Watch('selectedArea')
    public areaChanged(value: string) {
        this.selectedArea = value;
    }

    async beforeMount(): Promise<void> {
        this.areas = (await this.GQLService.getQuery<{ areas: string[] }>(`{ areas }`)).data.areas.sort();
    }
}

import Vue from 'vue';
import Component from 'vue-class-component';
import GQLService, { ILocation, IWaterReading, IAirReading } from '@/services/GQLService';
import moment from 'moment';
import { Watch } from 'vue-property-decorator';
import AreaChartComponent from '@/components/AreaChartComponent.vue';
import AreaLocationList from '@/components/AreaLocationList.vue';

@Component({
    components: {
        AreaChartComponent,
        AreaLocationList,
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

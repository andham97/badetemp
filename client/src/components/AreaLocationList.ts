import Vue from 'vue';
import { Prop, Component, Watch } from 'vue-property-decorator';
import GQLService, { IWaterReading } from '@/services/GQLService';
import moment from 'moment';

const hourNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

@Component
export default class AreaChartComponent extends Vue {
    @Prop() area!: string;

    @Watch('area')
    private areaUpdated() {
        this.loadList();
    }

    public data: IWaterReading[] = [];

    public timeIcon(time: string): string {
        return 'mdi-clock-time-' + hourNames[Number(moment(time).format('hh')) - 1];
    }

    public openDetailView(location: string): void {
        this.$router.push('/location/' + location);
    }

    private GQLService = new GQLService();

    async beforeMount(): Promise<void> {
        this.loadList();
    }

    private async loadList(): Promise<void> {
        const readings = await this.GQLService.getQuery<{ areaNewestWaterReadings: IWaterReading[] }>(`{ areaNewestWaterReadings(area: "${this.area}") { time temperature location { name } } }`);
        if (readings.data.areaNewestWaterReadings) {
            this.data = readings.data.areaNewestWaterReadings.map(reading => {
                reading.time = moment(reading.time).format('D. MMM' + (moment(reading.time).year() === moment().year() ? '' : ' YYYY') + ' HH:mm');
                return reading;
            }).sort((a, b) => {
                if (!a.location || !a.location.name || !b.location || !b.location.name) {
                    return 0;
                }
                return (a.location.name > b.location.name) ? 1 : ((b.location.name > a.location.name) ? -1 : 0);
            });
        }
        else {
            throw new Error(JSON.stringify(readings.errors));
        }
    }
}
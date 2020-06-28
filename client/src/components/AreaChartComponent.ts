import Vue from 'vue';
import { Prop, Component, Watch } from 'vue-property-decorator';
import GQLService, { IWaterReading } from '@/services/GQLService';
import moment from 'moment';

@Component
export default class AreaChartComponent extends Vue {
    @Prop() area!: string;
    @Prop({ default: () => ({}) }) chartOptions: Highcharts.Options | undefined;

    @Watch('area')
    private areaUpdated() {
        this.loadChart();
    }

    public defaultOptions: Highcharts.Options = {
        series: [],
        title: {
            text: 'Loading...',
        },
        pane: {
            size: '100%',
        },
        chart: {
            zoomType: 'xy',
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -40
                }
            },
        },
        tooltip: {
            followTouchMove: false,
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%e. %b'
            }
        },
        yAxis: {
            title: {
                text: '',
            },
            labels: {
                format: '{value} °C',
            },
        },
    };
    public options: Highcharts.Options = {
        ...this.defaultOptions,
        ...this.chartOptions,
    };

    private GQLService = new GQLService();

    async beforeMount(): Promise<void> {
        this.loadChart();
    }

    private async loadChart(): Promise<void> {
        if (this.options.title) {
            this.options.title.text = 'Loading (' + this.area + ')';
        }
        else {
            this.options.title = { text: 'Loading (' + this.area + ')' };
        }
        const readings = await this.GQLService.getQuery<{ areaWaterReadings: IWaterReading[] }>(`{ areaWaterReadings(area: "${this.area}") { time temperature location { name } } }`);
        if (readings.data.areaWaterReadings) {
            const mapped_readings = readings.data.areaWaterReadings.reduce((acc: { [key: string]: IWaterReading[] }, val) => {
                if (!val?.location?.name) {
                    return acc;
                }
                if (acc[val.location.name]) {
                    acc[val.location.name].push({ time: val.time, temperature: val.temperature });
                }
                else {
                    acc[val.location.name] = [{
                        time: val.time,
                        temperature: val.temperature,
                    }];
                }
                return acc;
            }, {});
            const data = Object.keys(mapped_readings).map<Highcharts.SeriesOptionsType>(location => ({
                data: mapped_readings[location].map(point => {
                    const t = moment(point.time as string).toObject();
                    return {
                        x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds),
                        y: Number((point.temperature as number).toFixed(1))
                    };
                }),
                type: 'line',
                name: location,
                visible: true,
            }));
            this.options.series = data.sort((a, b) => {
                if (!a.name || !b.name) {
                    return 0;
                }
                return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
            });
            if (!this.options.title) {
                this.options.title = { text: 'Overview (' + this.area + ')' };
            }
            else {
                this.options.title.text = 'Overview (' + this.area + ')';
            }
        }
        else {
            throw new Error(JSON.stringify(readings.errors));
        }
    }
}
import Vue from 'vue';
import Component from 'vue-class-component';
import GQLService, { ILocation, IWaterReading, IAirReading } from '@/services/GQLService';
import moment from 'moment';
import { Watch } from 'vue-property-decorator';

interface IChartSerie {
    data: {
        x: number | Date;
        y: number;
    }[];
    type: string;
    name: string;
    visible?: boolean;
    showInLegend?: boolean;
}

interface IChartOptions {
    series: IChartSerie[],
    title?: {
        text: string;
    }
    pane?: {
        size: string;
    }
    xAxis?: {
        type: string;
        dateTimeLabelFormats?: {
            day?: string;
        }
    }
    chart?: {
        zoomType: string;
        resetZoomButton?: {
            position: {
                x: number;
                y: number;
            }
        },
        width?: number | string;
        height?: number | string;
    }
    tooltip?: {
        followTouchMove?: boolean;
    }
    yAxis?: {
        labels?: {
            format?: string,
        }
        title?: {
            text?: string
        }
    }
}

@Component
export default class Overview extends Vue {
    public data: IChartSerie[] = [];
    public chartOptions: IChartOptions = {
        series: [] as IChartSerie[],
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
    public selectedArea = 'Siljan';
    public locations: ILocation[] = [];
    public areas: string[] = [];

    private GQLService = new GQLService();

    @Watch('selectedArea')
    public areaChanged(value: string) {
        this.selectedArea = value;
        this.updateChart();
    }

    async mounted(): Promise<void> {
        this.locations = (await this.GQLService.getQuery<{ locations: ILocation[] }>(`{ locations { id name area }}`)).data.locations;
        this.areas = Object.keys(this.locations.reduce((acc: { [key: string]: boolean }, v: ILocation) => {
            if (!v.area) {
                return acc;
            }
            acc[v.area] = true;
            return acc;
        }, {})).sort();
        this.updateChart();
    }

    async updateChart(): Promise<void> {
        const res = await Promise
            .all(this.locations
                .filter(l => l.area === this.selectedArea)
                .map(async (location) => 
                    this.GQLService.getQuery<{ waterReadings: IWaterReading[] }>(
                        `{ waterReadings(location: "${location.id}") { time temperature location { id name } } }`
                    )
                )
            );
        if (res?.length > 0) {
            this.data = [];
            res.forEach(line => {
                if (line.data.waterReadings?.length > 0 && line.data.waterReadings[0].location) {
                    this.data.push({
                        data: line.data.waterReadings.reverse().map(point => {
                            const t = moment(point.time as string).toObject();
                            return { x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds), y: Number((point.temperature as number).toFixed(1)) };
                        }),
                        type: 'line',
                        name: line.data.waterReadings[0].location.name as string,
                        visible: true,
                    });
                }
            });
            this.chartOptions.series = this.data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));;
            if (!this.chartOptions.title) {
                this.chartOptions.title = { text: 'Overview (' + this.selectedArea + ')' };
            }
            else {
                this.chartOptions.title.text = 'Overview (' + this.selectedArea + ')';
            }
        }
    }
}

import Vue from 'vue';
import Component from 'vue-class-component';
import GQLService, { ILocation, IWaterReading, IAirReading } from '@/services/GQLService';
import moment from 'moment';

interface IChartSerie {
    data: {
        x: number | Date;
        y: number;
    }[];
    type: string;
    name?: string;
    visible?: boolean;
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
        }
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
            text: 'Overview',
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
            }
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

    private GQLService = new GQLService();
    private initialLocationsVisible = ['Heivannet', 'Meitjenn', 'Rødstjønn', 'Frotjenn', 'Vanebuvann', 'Opdalsvannet', 'Puppen', 'Øverbøtjønna', 'Gorningen', 'Mykle', 'Lakssjø'];

    async mounted() {
        const locations = (await this.GQLService.getQuery<{ locations: ILocation[] }>(`{ locations { name }}`)).locations;
        const res = await Promise
            .all(locations
                .map(async (location) => 
                    this.GQLService.getQuery<{ waterReadings: IWaterReading[] }>(
                        `{ waterReadings(location: "${location.name}") { time temp location { name }}}`
                    )
                )
            );
        console.log(res);
        if (res?.length > 0) {
            this.data = [];
            res.forEach(line => {
                if (line.waterReadings?.length > 0) {
                    let visible = false;
                    if (line.waterReadings[0].location?.name) {
                        visible = this.initialLocationsVisible.indexOf(line.waterReadings[0].location?.name) > -1;
                    }
                    this.data.push({
                        data: line.waterReadings.map(point => {
                            const t = moment(point.time as string).toObject();
                            return { x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds), y: point.temp as number };
                        }),
                        type: 'line',
                        name: line.waterReadings[0].location?.name,
                        visible,
                    });
                }
            });
            console.log(this.data);
            this.chartOptions.series = this.data;
        }
    }
}

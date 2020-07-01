import Vue from 'vue';
import moment from 'moment';
import { Component, Prop, Watch } from 'vue-property-decorator';
import GQLService, { IWaterReading, ILocation, IAirReading } from '@/services/GQLService';

@Component
export default class LocationChart extends Vue {
    @Prop() location!: string;
    @Prop({ default: true }) showAirTemperatures: boolean | undefined;
    @Prop({ default: true }) showPercipitation: boolean | undefined;
    @Prop({ default: () => ({}) }) chartOptions: Highcharts.Options | undefined;

    @Watch('area')
    @Watch('showPercipitation')
    @Watch('showAirTemperatures')
    private propUpdate() {
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
        yAxis: [
            {
                title: {
                    text: '',
                },
                labels: {
                    format: '{value} °C',
                },
            },
            {
                title: {
                    text: '',
                },
                labels: {
                    format: '{value} mm',
                },
            },
        ],
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
            this.options.title.text = 'Loading (' + this.location + ')';
        }
        else {
            this.options.title = { text: 'Loading (' + this.location + ')' };
        }
        const location = (await this.GQLService.getQuery<{ location: ILocation }>(`{ location(name: "${this.location}") { id } }`)).data;
        if (!location) {
            console.error('Location not recognized');
        }
        
        const water_readings = (await this.GQLService.getQuery<{ locationWaterReadings: IWaterReading[] }>(`{ locationWaterReadings(location: ${location.location.id}) { temperature time } }`)).data;
        this.options.series?.push({
            name: 'Water temperature',
            data: water_readings.locationWaterReadings.map(point => {
                const t = moment(point.time as string).toObject();
                return {
                    x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds),
                    y: Number((point.temperature as number).toFixed(1))
                };
            }),
            type: 'line',
            stickyTracking: false,
        });

        const air_readings = (await this.GQLService.getQuery<{ locationAirReadings: IAirReading[] }>(`{ locationAirReadings(location: ${location.location.id}) { time precipitation temperature } }`)).data;
        if (air_readings.locationAirReadings.length > 0) {
            this.options.series?.push({
                name: 'Air temperature',
                data: air_readings.locationAirReadings.map(point => {
                    const t = moment(point.time as string).toObject();
                    return {
                        x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds),
                        y: Number((point.temperature as number).toFixed(1))
                    };
                }),
                type: 'line',
                stickyTracking: false,
            });
            this.options.series?.push({
                name: 'Precipitation',
                data: air_readings.locationAirReadings.map(point => {
                    const t = moment(point.time as string).toObject();
                    return {
                        x: Date.UTC(t.years, t.months, t.date, t.hours, t.minutes, t.seconds),
                        y: Number((point.precipitation as number).toFixed(1))
                    };
                }),
                type: 'bar',
                yAxis: 1,
                stickyTracking: false,
            });
        }
    }
}